const router = require('express').Router();

const { getStatus, setStatus } = require('../../lib/update/status');

const checkAdmin = require('../../middlewares/admin');
const { getUpdateStatusController, patchUpdateStatusController } = require('../../controllers/update/status');

/**
 * Route that indicate if an update is in progress.
 */
router.get('/job/status', getUpdateStatusController);

/**
 * Route that reverses the status.
 * Auth required.
 */
router.patch('/job/status', checkAdmin, patchUpdateStatusController);

module.exports = router;

function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/job/status',
    schema: {
      tags: ['State'],
      summary: 'Get status',
      description: 'Get status of service, if status is as true, an job is in progress',
      response: {
        200: {
          type: 'object',
        },
      },
    },
    handler: async (request, reply) => {
      const status = getStatus();
      return reply.status(200).json(status);
    },
  });

  fastify.route({
    method: 'PATCH',
    url: '/job/status',
    schema: {
      tags: ['State'],
      summary: 'Update status of service',
      description: 'Force to update status of service',
      response: {
        200: {
          type: 'object',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const status = setStatus();
      setStatus(!status);
      return reply.status(200).json(status);
    },
  });
}

module.exports = routes;
