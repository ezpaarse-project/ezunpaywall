const fs = require('fs-extra');
const path = require('path');
const joi = require('joi');

const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');
const enrichedDir = path.resolve(__dirname, '..', '..', 'data', 'enriched');

async function getEnrichedFile(req, res, next) {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fs.readdir(path.resolve(enrichedDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
}

async function getUploadedFile(req, res, next) {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fs.readdir(path.resolve(uploadDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
}

async function getEnrichedFileByFilename(req, res, next) {
  const { filename } = req.params;

  const { error } = joi.string().trim().required().validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  if (!await fs.pathExists(path.resolve(enrichedDir, apikey, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  return res.sendFile(path.resolve(enrichedDir, apikey, filename));
}

async function uploadFile(req, res, next) {
  if (!req?.file) return next({ message: 'File not sent' });
  const { filename } = req?.file;
  return res.status(200).json(path.parse(filename).name);
}

module.exports = {
  getEnrichedFile,
  getUploadedFile,
  getEnrichedFileByFilename,
  uploadFile,
};
