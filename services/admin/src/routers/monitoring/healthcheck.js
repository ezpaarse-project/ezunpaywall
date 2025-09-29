const healthCheckLogger = require('../../lib/logger/healthcheck');

function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/healthcheck',
    schema: {
      tags: ['Monitoring'],
      summary: 'Healthcheck endpoint',
      description: 'Endpoint to verify that the API is running and log request metrics',
      response: {
        204: {
          description: 'No content, service is healthy',
          type: 'null',
        },
      },
    },
    preHandler: (request, reply, done) => {
      request.startTime = Date.now();
      done();
    },
    handler: async (request, reply) => {
      reply.code(204).send();
    },
    onResponse: (request, reply, done) => {
      const duration = Date.now() - request.startTime;
      healthCheckLogger.info({
        ip: request.ip,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        userAgent: request.headers['user-agent'] || '-',
        responseTime: `${duration}ms`,
      });
      done();
    },
  });
}

module.exports = routes;
