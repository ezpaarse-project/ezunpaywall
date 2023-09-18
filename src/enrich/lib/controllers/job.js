const fs = require('fs-extra');
const path = require('path');

const {
  enrichJSON,
  enrichCSV,
} = require('../job');

const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');

/**
 * Controller to do enrich job.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function job(req, res, next) {
  const { id, config } = req.data;

  const apikey = req.get('x-api-key');

  const {
    type, args, index, separator, prefix,
  } = config;

  if (!await fs.pathExists(path.resolve(uploadDir, apikey, `${id}.${type}`))) {
    return res.status(404).json({ message: `[file] ${id}.${type} not found` });
  }

  if (type === 'jsonl') {
    enrichJSON(id, index, args, prefix, apikey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apikey, prefix, separator);
  }

  return res.status(200).json(id);
}

module.exports = job;
