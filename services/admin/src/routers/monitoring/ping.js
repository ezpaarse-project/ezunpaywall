const promiseWithTimeout = require('../../lib/ping');
const { pingRedis } = require('../../lib/redis');
const { pingElastic } = require('../../lib/elastic');
const { pingUnpaywall } = require('../../lib/unpaywall/api');
const { pingSMTP } = require('../../lib/mail');

const statusSchema = { type: 'object', properties: { healthy: { type: 'boolean' }, elapsedTime: { type: 'number' }, error: { type: 'string', nullable: true } } };

function routes(fastify) {
  fastify.route({
    method: 'GET',
    route: '/',
    schema: {
      tags: ['Monitoring'],
      summary: 'Home',
      description: 'Get the name of service.',
      response: {
        200: {
          type: 'string',
          example: 'ezUNPAYWALL admin API',
        },
      },
    },
    handler: async (request, reply) => {
      reply.code(200).send('ezUNPAYWALL admin API');
    },
  });

  fastify.route('/ping', {
    schema: {
      method: 'GET',
      tags: ['Monitoring'],
      summary: 'Ping the service',
      description: 'Check if the API service is reachable.',
      response: {
        204: { type: 'null', description: 'Service is alive' },
      },
    },
    handler: (request, reply) => reply.code(204).send(),
  });

  fastify.route({
    method: 'GET',
    route: '/status',
    schema: {
      tags: ['Monitoring'],
      summary: 'Ping all services',
      description: 'Ping all services connected to the admin service (Redis, Elastic, Unpaywall, SMTP).',
      response: {
        200: {
          type: 'object',
          properties: {
            redis: statusSchema,
            elastic: statusSchema,
            unpaywall: statusSchema,
            smtp: statusSchema,
            elapsedTime: { type: 'number', description: 'Total elapsed time in ms' },
            healthy: { type: 'boolean', description: 'Overall health status' },
          },
        },
      },
    },
    handler: async (request, reply) => {
      const start = Date.now();

      const p1 = promiseWithTimeout(pingRedis(), 'redis');
      const p2 = promiseWithTimeout(pingElastic(), 'elastic');
      const p3 = promiseWithTimeout(pingUnpaywall(), 'unpaywall');
      const p4 = promiseWithTimeout(pingSMTP(), 'smtp');

      let resultPing = await Promise.allSettled([p1, p2, p3, p4]);
      resultPing = resultPing.map((e) => e.value);

      const result = {};
      resultPing.forEach((e) => {
        result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
      });

      const healthy = resultPing.every((e) => e?.healthy);
      result.elapsedTime = Date.now() - start;
      result.healthy = healthy;

      return reply.code(200).send(result);
    },
  });
}

module.exports = routes;
