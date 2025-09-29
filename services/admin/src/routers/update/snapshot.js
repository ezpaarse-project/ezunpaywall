const fs = require('fs');
const path = require('path');
const fsp = require('fs/promises');
const { paths } = require('config');

const upload = require('../../middlewares/uploadSnapshot');
const checkAdmin = require('../../plugins/admin');

const { getMostRecentFile, deleteFile } = require('../../lib/files');

async function routes(fastify) {
  fastify.route({
    method: 'GET',
    url: '/snapshots',
    schema: {
      tags: ['Snapshots'],
      summary: 'Get snapshots',
      description: 'Get the list of snapshots installed on ezunpaywall or the most recent file if query `latest=true` is provided.',
      querystring: {
        type: 'object',
        properties: {
          latest: { type: 'boolean', description: 'If true, only the most recent snapshot is returned' },
        },
        additionalProperties: false,
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { latest } = request.data;

      if (latest) {
        const latestSnapshot = await getMostRecentFile(paths.data.snapshotsDir);

        return reply.code(200).send(latestSnapshot?.filename);
      }
      const files = await fsp.readdir(paths.data.snapshotsDir);
      return reply.code(200).send(files.reverse());
    },
  });

  fastify.route({
    method: 'POST',
    url: '/snapshots',
    schema: {
      tags: ['Snapshots'],
      summary: 'Upload snapshot',
      description: 'Upload a snapshot on ezunpaywall. Requires a multipart body with a file.',
      consumes: ['multipart/form-data'],
    },
    preHandler: [checkAdmin, upload.single('file')],
    handler: async (request, reply) => {
      const data = await request.file();
      const saveTo = path.join(paths.data.snapshotsDir, data.filename);

      const writeStream = fs.createWriteStream(saveTo);
      await data.file.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      reply.code(200).send({ filename: data.filename, mimetype: data.mimetype });
    },
  });

  // Delete snapshot by filename
  fastify.route({
    method: 'DELETE',
    url: '/snapshots/:filename',
    schema: {
      tags: ['Snapshots'],
      summary: 'Delete snapshot',
      description: 'Delete a snapshot by its filename.',
      params: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Filename of the snapshot to delete' },
        },
        required: ['filename'],
      },
    },
    preHandler: [checkAdmin],
    handler: async (request, reply) => {
      const { filename } = request.data;

      try {
        await fsp.access(path.resolve(paths.data.snapshotsDir, filename));
      } catch (err) {
        return reply.code(404).send({ message: `File [${filename}] not found` });
      }

      await deleteFile(path.resolve(paths.data.snapshotsDir, filename));

      return reply.code(202).send();
    },
  });
}

module.exports = routes;
