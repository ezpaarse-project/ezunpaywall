const { format } = require('date-fns');

const checkAdmin = require('../../../plugins/admin');
const checkStatus = require('../../../plugins/status');

const {
  downloadInsertChangefilesProcess,
} = require('../../../lib/update');

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/job/changefiles/download/insert',
    schema: {
      tags: ['Job'],
      summary: 'Download and insert on elastic the changefiles from unpaywall between a period.',
      description: 'Download and insert on elastic the changefiles from unpaywall between a period.',
      body: {
        type: 'object',
        properties: {
          index: { type: 'string', default: 'unpaywall' },
          interval: { type: 'string', enum: ['day', 'week'], default: 'day' },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          ignoreError: { type: 'boolean', default: false },
          cleanFile: { type: 'boolean', default: false },
        },
        required: ['startDate', 'endDate'],
        additionalProperties: false,
      },
      response: {
        202: {
          type: 'object',
        },
      },
    },
    preHandler: [checkAdmin, checkStatus],
    handler: async (request, reply) => {
      const { jobConfig } = request.data;

      const {
        startDate,
        endDate,
        interval,
      } = jobConfig;

      if (new Date(startDate).getTime() > Date.now()) {
        return reply.code(400).send({ message: 'startDate cannot be in the future' });
      }

      if (startDate && endDate) {
        if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
          return reply.code(400).send({ message: 'endDate cannot be lower than startDate' });
        }
      }

      jobConfig.type = 'changefile';
      jobConfig.offset = 0;
      jobConfig.limit = -1;

      if (!startDate && !endDate) {
        jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');
        if (interval === 'week') jobConfig.startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
        if (interval === 'day') jobConfig.startDate = format(new Date(), 'yyyy-MM-dd');

        downloadInsertChangefilesProcess(jobConfig);
        return reply.code(202).send();
      }

      if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

      downloadInsertChangefilesProcess(jobConfig);
      return reply.code(202).send();
    },
  });

  fastify.route({
    method: 'POST',
    url: '/job/changefiles/insert/:filename',
    schema: {
      tags: ['Job'],
      summary: 'Insert on elastic the changefiles from unpaywall between a period.',
      description: 'Insert on elastic the changefiles from unpaywall between a period.',
      body: {
        type: 'object',
        properties: {
          index: { type: 'string', default: 'unpaywall' },
          offset: { type: 'integer', minimum: 0, default: 0 },
          limit: { type: 'integer', default: -1 },
          ignoreError: { type: 'boolean', default: false },
          cleanFile: { type: 'boolean', default: false },
        },
        additionalProperties: false,
      },
      response: {
        202: {
          type: 'object',
        },
      },
    },
    preHandler: [checkAdmin, checkStatus],
    handler: async (request, reply) => {
      await downloadInsertChangefilesProcess();
      return reply.code(202).send();
    },
  });
}

module.exports = routes;
