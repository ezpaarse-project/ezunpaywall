const path = require('path');
const fs = require('fs');
const { paths } = require('config');

const checkAdmin = require('../../../plugins/admin');
const checkStatus = require('../../../plugins/status');

const {
  downloadSnapshotProcess,
  downloadInsertSnapshotProcess,
  insertFileProcess,
} = require('../../../lib/update');

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/job/snapshots/download',
    schema: {
      tags: ['Job'],
      summary: 'Download the current snapshot of unpaywall',
      description: 'Download the current snapshot of unpaywall',
      response: {
        202: {
          type: 'object',
        },
      },
    },
    preHandler: [checkAdmin, checkStatus],
    handler: async (request, reply) => {
      await downloadSnapshotProcess();
      return reply.code(202).send();
    },
  });
  fastify.route({
    method: 'POST',
    url: '/job/snapshots/download/insert',
    schema: {
      tags: ['Job'],
      summary: 'Download and insert the current snapshot of unpaywall',
      description: 'Download and insert the current snapshot of unpaywall',
      response: {
        202: {
          type: 'object',
        },
      },
    },
    preHandler: [checkAdmin, checkStatus],
    handler: async (request, reply) => {
      await downloadInsertSnapshotProcess();
      return reply.code(202).send();
    },
  });
  fastify.route({
    method: 'POST',
    url: '/job/snapshots/insert/:filename',
    schema: {
      tags: ['Job'],
      summary: 'Download the current changefiles of unpaywall',
      description: 'Download the current changefiles of unpaywall',
      response: {
        202: {
          type: 'object',
        },
      },
    },
    preHandler: [checkAdmin, checkStatus],
    handler: async (request, reply) => {
      const { jobConfig } = request.data;

      const { filename } = jobConfig;

      if (!await fs.exists(path.resolve(paths.data.snapshotsDir, filename))) {
        return reply.status(404).send({ message: `File [${filename}] not found` });
      }

      jobConfig.type = 'snapshot';

      insertFileProcess(jobConfig);

      return reply.status(202).send();
    },
  });
}

module.exports = routes;
