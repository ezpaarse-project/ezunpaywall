const { paths } = require('config');
const fsp = require('fs/promises');
const path = require('path');

const { getMostRecentFile } = require('../../lib/files');
const { getReport } = require('../../lib/update/report');

function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/reports',
    schema: {
      tags: ['Reports'],
      summary: 'Get reports',
      description: 'Get the list of reports or the most recent report in JSON format. Supports `latest` and `type` query parameters.',
      querystring: {
        type: 'object',
        properties: {
          latest: { type: 'boolean', description: 'If true, only return the most recent report' },
          type: { type: 'string', description: 'Filter by type of report' },
        },
        additionalProperties: false,
      },
    },
    handler: async (request, reply) => {
      const { latest, type } = request.data;

      if (latest) {
        const latestFile = await getMostRecentFile(paths.data.reportsDir);

        if (!latestFile) {
          return reply.code(404).send('No reports are available');
        }

        const report = await getReport(latestFile?.filename);
        return reply.code(200).send(report);
      }

      let reports = await fsp.readdir(paths.data.reportsDir);

      reports = reports.sort((a, b) => {
        const [date1] = a.split('_');
        const [date2] = b.split('_');
        return new Date(date2).getTime() - new Date(date1).getTime();
      });

      if (type) {
        reports = reports.filter((report) => report.includes(`${type}`));
      }

      return reply.code(200).send(reports);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/reports/:filename',
    schema: {
      tags: ['Reports'],
      summary: 'Get report by filename',
      description: 'Get the content of a report in JSON format. The `filename` parameter must correspond to an existing report.',
      params: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Filename of the report' },
        },
        required: ['filename'],
      },
    },
    handler: async (request, reply) => {
      const { filename } = request.data;

      try {
        await fsp.access(path.resolve(paths.data.changefilesDir, filename));
      } catch (err) {
        return reply.code(404).send({ message: `File [${filename}] not found` });
      }

      const report = await getReport(filename);

      return reply.code(200).send(report);
    },
  });
}

module.exports = routes;
