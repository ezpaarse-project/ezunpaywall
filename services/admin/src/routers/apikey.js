/* eslint-disable no-restricted-syntax */
const apikeyService = require('../lib/apikeys');
const checkAdmin = require('../plugins/admin');
const appLogger = require('../lib/logger/appLogger');
const { getClient } = require('../lib/redis/client');

function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/apikeys',
    schema: {
      tags: ['API Key'],
      summary: 'Get all API keys',
      description: 'Retrieve all API keys and their configurations.',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              apikey: { type: 'string' },
              config: { type: 'object' },
            },
          },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const redisClient = getClient();
      let keys;
      try {
        keys = await redisClient.keys('*');
      } catch (err) {
        appLogger.error('[redis]: Cannot get all keys on redis', err);
        throw fastify.httpErrors.internalServerError('Cannot get all keys on redis');
      }

      if (!Array.isArray(keys)) {
        appLogger.error(`[redis]: [${keys}] is not an array`);
        throw fastify.httpErrors.internalServerError(`[${keys}] is not an array`);
      }

      const allKeys = [];

      for (const apikey of keys) {
        let config;
        try {
          config = await redisClient.get(apikey);
          config = JSON.parse(config);
        } catch (err) {
          appLogger.error(`[redis]: Cannot parse config for key [${apikey}]`, err);
          throw fastify.httpErrors.internalServerError(`Cannot parse config for key [${apikey}]`);
        }
        allKeys.push({ apikey, config });
      }

      allKeys.sort((a, b) => a.config?.name?.localeCompare(b.config?.name));

      return reply.code(200).send(allKeys);
    },
  });

  // Get one API key
  fastify.route({
    method: 'GET',
    url: '/apikeys/:apikey',
    schema: {
      tags: ['API Key'],
      summary: 'Get API key',
      description: 'Retrieve configuration of one API key.',
      params: {
        type: 'object',
        properties: {
          apikey: { type: 'string' },
        },
        required: ['apikey'],
      },
      response: {
        200: { type: 'object' },
        404: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { apikey } = request.params;
      let config;
      try {
        config = await apikeyService.get(apikey);
      } catch (err) {
        throw fastify.httpErrors.internalServerError(`Cannot get config for apikey [${apikey}]`);
      }

      if (!config) {
        return reply.code(404).send({ message: `Config for [${apikey}] not found` });
      }

      return reply.code(200).send(config);
    },
  });

  // Create API key
  fastify.route({
    method: 'POST',
    url: '/apikeys',
    schema: {
      tags: ['API Key'],
      summary: 'Create API key',
      description: 'Create a new API key with configuration.',
      body: { type: 'object' }, // tu peux détailler le schéma
      response: {
        200: {
          type: 'object',
          properties: {
            apikey: { type: 'string' },
            config: { type: 'object' },
          },
        },
        409: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const redisClient = getClient();
      const apikeyConfig = request.body;
      const { name } = apikeyConfig;

      let keys;
      try {
        keys = await redisClient.keys('*');
      } catch (err) {
        throw fastify.httpErrors.internalServerError('Cannot get all keys');
      }

      for (const key of keys) {
        let config;
        try {
          config = JSON.parse(await redisClient.get(key));
        } catch (err) {
          throw fastify.httpErrors.internalServerError(`Cannot parse config for key [${key}]`);
        }
        if (config?.name === name) {
          return reply.code(409).send({ message: `Name [${name}] already exists for a key` });
        }
      }

      let apikey;
      try {
        apikey = await apikeyService.create(apikeyConfig);
      } catch (err) {
        throw fastify.httpErrors.internalServerError('Cannot create apikey');
      }

      const config = JSON.parse(await redisClient.get(apikey));
      return reply.code(200).send({ apikey, config });
    },
  });

  // Update API key
  fastify.route({
    method: 'PUT',
    url: '/apikeys/:apikey',
    schema: {
      tags: ['API Key'],
      summary: 'Update API key',
      description: 'Update an existing API key configuration.',
      body: {
        type: 'object',
        required: ['apikey', 'apikeyConfig'],
        properties: {
          apikey: { type: 'string' },
          apikeyConfig: { type: 'object' },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const redisClient = getClient();
      const { apikey, apikeyConfig } = request.body;
      const { name } = apikeyConfig;

      const getConfig = async (key) => {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
      };

      const existing = await getConfig(apikey);
      if (!existing) {
        return reply.code(404).send({ message: `Apikey [${apikey}] not found` });
      }

      if (existing.name !== name) {
        const keys = await redisClient.keys('*');
        for (const key of keys) {
          const config = await getConfig(key);
          if (config?.name === name) {
            return reply.code(409).send({ message: `Name [${name}] already exists` });
          }
        }
      }

      await apikeyService.update(apikey, apikeyConfig);
      const updated = await getConfig(apikey);
      return reply.code(200).send({ apikey, ...updated });
    },
  });

  // Delete API key
  fastify.delete('/apikeys/:apikey', {
    schema: {
      tags: ['API Key'],
      summary: 'Delete API key',
      description: 'Delete an API key by its identifier.',
      params: {
        type: 'object',
        properties: { apikey: { type: 'string' } },
        required: ['apikey'],
      },
      response: {
        204: { type: 'null' },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const redisClient = getClient();
      const { apikey } = request.params;

      const exists = await redisClient.get(apikey);
      if (!exists) {
        return reply.code(404).send({ message: `Apikey [${apikey}] not found` });
      }

      await apikeyService.remove(apikey);
      return reply.code(204).send();
    },
  });

  // Import API keys
  fastify.post('/apikeys/import', {
    preHandler: checkAdmin,
    schema: {
      tags: ['API Key'],
      summary: 'Import API keys',
      description: 'Bulk import of API keys with configuration.',
      body: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            apikey: { type: 'string' },
            config: { type: 'object' },
          },
        },
      },
      response: {
        204: { type: 'null' },
      },
    },
    handler: async (request, reply) => {
      const redisClient = getClient();
      const loadKeys = request.body;

      for (const { apikey, config } of loadKeys) {
        try {
          await redisClient.set(apikey, JSON.stringify(config));
          appLogger.info(`[redis]: ${config.name} is loaded`);
        } catch (err) {
          throw fastify.httpErrors.internalServerError(`Cannot load [${apikey}]`);
        }
      }

      return reply.code(204).send();
    },
  });
}

module.exports = routes;
