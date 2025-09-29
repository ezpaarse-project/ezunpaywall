const countDOI = require('../../middlewares/doi');

const { updateDOI, getCount, getCachedDOI } = require('../../lib/update/doi');

async function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/doi/update',
    schema: {
      tags: ['DOI'],
      summary: 'Update one DOI',
      description: 'Update one DOI on ezunpaywall from unpaywall',
    },
    preHandler: countDOI,
    handler: async (request, reply) => {
      const { dois } = request.body;

      if (!Array.isArray(dois)) {
        return reply.code(400).send({ message: 'Dois must be an array' });
      }

      await updateDOI(dois);

      return reply.code(202).send();
    },
  });

  fastify.route({
    method: 'GET',
    url: '/doi/update/count',
    schema: {
      tags: ['DOI'],
      summary: 'Count updated DOIs',
      description: 'Get count of DOIs updated during the current day',
    },
    handler: async (request, reply) => {
      const count = await getCount();
      return reply.code(200).send(count);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/doi/update/cache',
    schema: {
      tags: ['DOI'],
      summary: 'Get cached DOIs',
      description: 'Get cache of DOIs updated during the current day',
    },
    handler: async (request, reply) => {
      const dois = await getCachedDOI();
      return reply.code(200).send(dois);
    },
  });
}

module.exports = routes;
