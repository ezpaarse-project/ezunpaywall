const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');
const { paths } = require('config');

const upload = require('../../middlewares/uploadChangefile');
const checkAdmin = require('../../middlewares/admin');

const { getMostRecentFile, deleteFile } = require('../../lib/files');

async function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/changefiles',
    schema: {
      tags: ['Changefiles'],
      summary: 'Get changefiles',
      description: 'Get the list of changefiles installed or only the most recent if query `latest` is provided.',
      querystring: {
        type: 'object',
        properties: {
          latest: { type: 'boolean', description: 'If true, only the most recent changefile is returned' },
        },
        additionalProperties: false,
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { latest } = request.data;

      if (latest) {
        const latestChangefile = await getMostRecentFile(paths.data.changefilesDir);
        return reply.code(200).send(latestChangefile?.filename);
      }

      const files = await fsp.readdir(paths.data.changefilesDir);
      return reply.code(200).send(files.reverse());
    },
  });

  fastify.route({
    method: 'POST',
    url: '/changefiles',
    schema: {
      tags: ['Changefiles'],
      summary: 'Upload a changefile',
      description: 'Upload a changefile on ezunpaywall. Requires a multipart body with a `file` field.',
    },
    preHandler: [checkAdmin, upload.single('file')],
    handler: async (request, reply) => {
      const data = await request.file();
      const saveTo = path.join(paths.data.changefilesDir, data.filename);

      const writeStream = fs.createWriteStream(saveTo);
      await data.file.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      reply.code(200).send({ filename: data.filename, mimetype: data.mimetype });
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/changefiles/:filename',
    schema: {
      tags: ['Changefiles'],
      summary: 'Delete a changefile',
      description: 'Delete a changefile by filename.',
      params: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Name of the changefile to delete' },
        },
        required: ['filename'],
      },
    },
    preHandler: [checkAdmin],
    handler: async (request, reply) => {
      const { filename } = request.data;

      try {
        await fsp.access(path.resolve(paths.data.changefilesDir, filename));
      } catch (err) {
        return reply.code(404).send({ message: `File [${filename}] not found` });
      }

      await deleteFile(path.resolve(paths.data.changefilesDir, filename));

      return reply.code(202).send();
    },
  });
}

module.exports = routes;
