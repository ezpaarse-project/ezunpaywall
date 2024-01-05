const fs = require('fs-extra');
const path = require('path');

const dirPath = require('../../path');

const {
  getMostRecentFile,
  deleteFile,
} = require('../../file');

const { snapshotsDir } = dirPath.unpaywall;

/**
 * Controller to start list of files or latest file downloaded on update service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getFiles(req, res, next) {
  const latest = req.data;

  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(snapshotsDir);
    } catch (err) {
      return next({ message: 'Cannot get the lastest snapshot' });
    }
    return res.status(200).json(latestSnapshot?.filename);
  }
  const files = await fs.readdir(snapshotsDir);
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
  const filename = req.data;

  if (!await fs.pathExists(path.resolve(snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(path.resolve(snapshotsDir, filename));
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
