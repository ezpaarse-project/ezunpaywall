async function router(fastify) {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['ping'],
      summary: 'Ping the service',
      description: 'Ping the service',
    },
    handler: async (req, res) => res.status(200).json('ezUNPAYWALL admin API'),
  });
  fastify.route('/ping', (req, res) => res.status(204).end());
  fastify.route('/status', (req, res) => res.status(204).end());
}

module.exports = router;
