const { getDiskSpace, formatBytes } = require('../../lib/disk');

const checkAdmin = require('../../middlewares/admin');

function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/disk',
    schema: {
      tags: ['Monitoring'],
      summary: 'Disk space',
      description: 'Get disk space.',
      response: {
        200: {
          type: 'object',
          example: {
            total: 'string',
            available: 'string',
          },
        },
      },
    },
    prehandler: checkAdmin,
    handler: async (request, reply) => {
      const stats = await getDiskSpace();

      return reply.code(200).send({
        total: formatBytes(stats.blocks * stats.bsize),
        available: formatBytes(stats.bavail * stats.bsize),
      });
    },
  });
}

module.exports = routes;
