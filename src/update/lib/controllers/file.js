const fs = require('fs-extra');
const path = require('path');

const { getMostRecentFile, deleteFile } = require('../files');

const { getPathOfDirectory } = require('../files');

/**
 * Controller to start list of files or latest file downloaded on update service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getFiles(req, res, next) {
  const { latest, type } = req.data;

  const pathOfDirectory = getPathOfDirectory(type, 'snapshots');

  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(pathOfDirectory);
    } catch (err) {
      return next({ message: 'Cannot get the lastest snapshot' });
    }
    return res.status(200).json(latestSnapshot?.filename);
  }
  const files = await fs.readdir(pathOfDirectory);
  return res.status(200).json(files);
}

/**
 * Controller to upload a file with unpaywall data.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function uploadFile(req, res, next) {
  if (!req?.file) return next({ messsage: 'File not sent' });
  return res.status(202).json();
}

/**
 * Controller to delete file that content unpaywall data.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function deleteInstalledFile(req, res, next) {
  const { filename, type } = req.data;

  const pathOfDirectory = getPathOfDirectory(type, 'snapshots');

  if (!await fs.pathExists(path.resolve(pathOfDirectory, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(path.resolve(pathOfDirectory, filename));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(202).json();
}

module.exports = {
  getFiles,
  uploadFile,
  deleteInstalledFile,
};
