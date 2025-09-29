const { getConfig } = require('../../lib/config');

const checkAdmin = require('../../plugins/admin');

function routes(fastify) {
  fastify.route({
    method: 'GET',
    route: '/',
    schema: {
      tags: ['Monitoring'],
      summary: 'Get config',
      description: 'Get config of service.',
      response: {
        200: {
          type: 'object',
        },
      },
    },
    prehandler: checkAdmin,
    handler: async (request, reply) => {
      const config = getConfig();
      return reply.code(200).send(config);
    },
  });
}

module.exports = routes;
