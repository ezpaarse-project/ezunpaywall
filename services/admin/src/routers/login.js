const checkAdmin = require('../middlewares/admin');

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/login',
    config: {
      rateLimiter: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
    schema: {
      tags: ['Login'],
      summary: 'Login',
      description: 'Check if the content of the x-api-key header matches the environment variable used as password.',
      response: {
        204: {
          description: 'No content, service is healthy',
          type: 'null',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      reply.code(204).send();
    },
  });
}

module.exports = routes;
