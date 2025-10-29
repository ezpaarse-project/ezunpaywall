const dataUpdateCron = require('../cron/dataUpdate');
const dataUpdateHistoryCron = require('../cron/dataUpdateHistory');
const cleanFileCron = require('../cron/cleanFile');
const demoApiKeyCron = require('../cron/demoApikey');
const downloadSnapshotCron = require('../cron/downloadSnapshot');

const checkAdmin = require('../plugins/admin');

const paramsType = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['dataUpdate', 'dataUpdateHistory', 'cleanFile', 'demoApiKey', 'downloadSnapshot'],
    },
  },
  required: ['type'],
};

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/cron/:type/start',
    schema: {
      tags: ['Cron'],
      summary: 'Start cron',
      description: 'Start cron.',
      params: paramsType,
      response: {
        200: {
          type: 'object',
          properties: {
            demo: { type: 'boolean' },
            file: { type: 'boolean' },
            dataUpdate: { type: 'boolean' },
            dataUpdateHistory: { type: 'boolean' },
          },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { type } = request.params;

      if (type === 'dataUpdate') {
        dataUpdateCron.cron.start();
      }
      if (type === 'dataUpdateHistory') {
        dataUpdateHistoryCron.cron.start();
      }
      if (type === 'cleanFile') {
        cleanFileCron.cron.start();
      }
      if (type === 'demoApiKey') {
        demoApiKeyCron.cron.start();
      }
      if (type === 'downloadSnapshot') {
        downloadSnapshotCron.start();
      }
      return reply.code(202).end();
    },
  });
  fastify.route({
    method: 'POST',
    url: '/cron/:type/stop',
    schema: {
      tags: ['Cron'],
      summary: 'Stop cron',
      description: 'Stop cron.',
      params: paramsType,
      response: {
        200: {
          type: 'object',
          properties: {
            demo: { type: 'boolean' },
            file: { type: 'boolean' },
            dataUpdate: { type: 'boolean' },
            dataUpdateHistory: { type: 'boolean' },
          },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { type } = request.params;

      if (type === 'dataUpdate') {
        dataUpdateCron.cron.stop();
      }
      if (type === 'dataUpdateHistory') {
        dataUpdateHistoryCron.cron.stop();
      }
      if (type === 'cleanFile') {
        cleanFileCron.cron.stop();
      }
      if (type === 'demoApiKey') {
        demoApiKeyCron.cron.stop();
      }
      if (type === 'downloadSnapshot') {
        downloadSnapshotCron.stop();
      }
      return reply.code(202).end();
    },
  });
  fastify.route({
    method: 'PATCH',
    url: '/cron/:type',
    schema: {
      tags: ['Cron'],
      summary: 'Update cron',
      description: 'Update cron.',
      params: paramsType,
      body: {
        type: 'object',
        properties: {
          config: {
            type: 'object',
            properties: {
              demo: { type: 'boolean' },
              file: { type: 'boolean' },
              dataUpdate: { type: 'boolean' },
              dataUpdateHistory: { type: 'boolean' },
            },
          },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            demo: { type: 'boolean' },
            file: { type: 'boolean' },
            dataUpdate: { type: 'boolean' },
            dataUpdateHistory: { type: 'boolean' },
          },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { type } = request.params;
      const { config } = request.body;

      if (type === 'dataUpdate') {
        dataUpdateCron.cron.update(config);
      }
      if (type === 'dataUpdateHistory') {
        dataUpdateHistoryCron.cron.update(config);
      }
      if (type === 'cleanFile') {
        cleanFileCron.cron.update(config);
      }
      if (type === 'demoApiKey') {
        demoApiKeyCron.cron.update(config);
      }
      if (type === 'downloadSnapshot') {
        downloadSnapshotCron.update(config);
      }
      return reply.code(202).end();
    },
  });
  fastify.route({
    method: 'GET',
    url: '/cron/:type',
    schema: {
      tags: ['Cron'],
      summary: 'Get config cron',
      description: 'Get config cron.',
      params: paramsType,
      response: {
        200: {
          type: 'object',
          properties: {
            demo: { type: 'boolean' },
            file: { type: 'boolean' },
            dataUpdate: { type: 'boolean' },
            dataUpdateHistory: { type: 'boolean' },
          },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { type } = request.params;

      if (type === 'dataUpdate') {
        return reply.code(200).send(dataUpdateCron.cron.config);
      }
      if (type === 'dataUpdateHistory') {
        return reply.code(200).send(dataUpdateHistoryCron.cron.config);
      }
      if (type === 'cleanFile') {
        return reply.code(200).send(cleanFileCron.cron.config);
      }
      if (type === 'demoApiKey') {
        return reply.code(200).send(demoApiKeyCron.cron.config);
      }
      if (type === 'downloadSnapshot') {
        return reply.code(200).send(downloadSnapshotCron.config);
      }
    },
  });
}

module.exports = routes;
