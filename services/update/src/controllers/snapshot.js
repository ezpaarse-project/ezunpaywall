const fs = require('fs-extra');
const path = require('path');
const { paths } = require('config');

const { getMostRecentFile, deleteFile } = require('../files');

/**
 * Controller to start list of files or latest file downloaded on update service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getSnapshots(req, res, next) {
  const { latest } = req.data;

  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(paths.data.snapshotsDir);
    } catch (err) {
      return next({ message: 'Cannot get the latest snapshot' });
    }
    return res.status(200).json(latestSnapshot?.filename);
  }
  const files = await fs.readdir(paths.data.snapshotsDir);
  return res.status(200).json(files);
}

/**
 * Controller to upload a file with unpaywall data.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function uploadSnapshot(req, res, next) {
  if (!req?.file) return next({ message: 'File not sent' });
  return res.status(202).json();
}

/**
 * Controller to delete file that content unpaywall data.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function deleteSnapshot(req, res, next) {
  const { filename } = req.data;

  if (!await fs.pathExists(path.resolve(paths.data.snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(path.resolve(paths.data.snapshotsDir, filename));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(202).json();
}

module.exports = {
  getSnapshots,
  uploadSnapshot,
  deleteSnapshot,
};
