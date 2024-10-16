const config = require('config');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const joi = require('joi');

const { uploadDir, enrichedDir } = config.paths.data;

/**
 * Controller to get list of enriched files of user.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getEnrichedFiles(req, res, next) {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fsp.readdir(path.resolve(enrichedDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
}

/**
 * Controller to get list of uploaded files of user.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getUploadedFile(req, res, next) {
  const apikey = req.get('x-api-key');
  let files;
  try {
    files = await fsp.readdir(path.resolve(uploadDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
}

/**
 * Controller to get enriched file of user by filename.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getEnrichedFileByFilename(req, res, next) {
  const { filename } = req.params;

  const { error } = joi.string().trim().required().validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  if (!await fs.existsSync(path.resolve(enrichedDir, apikey, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  return res.sendFile(path.resolve(enrichedDir, apikey, filename));
}

/**
 * Controller to upload file.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function uploadFile(req, res, next) {
  if (!req?.file) return next({ message: 'File not sent' });
  const { filename } = req.file;
  return res.status(200).json(path.parse(filename).name);
}

module.exports = {
  getEnrichedFiles,
  getUploadedFile,
  getEnrichedFileByFilename,
  uploadFile,
};
