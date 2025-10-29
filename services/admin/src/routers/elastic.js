const checkAdmin = require('../plugins/admin');
const elastic = require('../lib/elastic');
const unpaywallMapping = require('../../mapping/unpaywall.json');

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/elastic/alias',
    schema: {
      tags: ['Elastic'],
      summary: 'Initialize Unpaywall Elastic alias',
      description: 'Creates an alias for the Unpaywall index with local mapping',
      response: {
        200: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of created indices',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const indices = await elastic.initAlias('unpaywall', unpaywallMapping, 'upw');
      return reply.code(200).send(indices);
    },
  });

  // Get alias on elastic
  fastify.route({
    method: 'GET',
    url: '/elastic/aliases',
    schema: {
      tags: ['Elastic'],
      summary: 'Get all aliases',
      description: 'Retrieve all aliases from Elasticsearch',
      response: {
        200: {
          type: 'object',
          description: 'Alias information',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const alias = await elastic.getAlias();
      return reply.code(200).send(alias);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/elastic/indices',
    schema: {
      tags: ['Elastic'],
      summary: 'Get all indices',
      description: 'Retrieve all indices from Elasticsearch',
      response: {
        200: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of indices',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const indices = await elastic.getIndices();
      return reply.code(200).send(indices);
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/elastic/indices/:indexName',
    schema: {
      tags: ['Elastic'],
      summary: 'Delete an index',
      description: 'Delete an index by name from Elasticsearch',
      params: {
        type: 'object',
        properties: {
          indexName: { type: 'string', description: 'Name of the index to delete' },
        },
        required: ['indexName'],
      },
      response: {
        200: {
          type: 'object',
          description: 'Result of deletion or updated alias info',
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { indexName } = request.params;
      const alias = await elastic.removeIndex(indexName);
      return reply.code(200).send(alias);
    },
  });
}

module.exports = routes;
