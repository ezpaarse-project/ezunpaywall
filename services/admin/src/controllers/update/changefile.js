const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { paths } = require('config');

const { getMostRecentFile, deleteFile } = require('../../lib/files');

/**
 * Controller to start list of files or latest file downloaded on update service.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getChangefiles(req, res, next) {
  const { latest } = req.data;

  if (latest) {
    let latestChangefile;
    try {
      latestChangefile = await getMostRecentFile(paths.data.changefilesDir);
    } catch (err) {
      return next({ message: 'Cannot get the latest changefile' });
    }
    return res.status(200).json(latestChangefile?.filename);
  }
  const files = await fsp.readdir(paths.data.changefilesDir);
  return res.status(200).json(files);
}

/**
 * Controller to upload a file with unpaywall data.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function uploadChangefile(req, res, next) {
  if (!req?.file) return next({ message: 'File not sent' });
  return res.status(202).json();
}

/**
 * Controller to delete file that content unpaywall data.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function deleteChangefile(req, res, next) {
  const { filename } = req.data;

  if (!await fs.existsSync(path.resolve(paths.data.changefilesDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(path.resolve(paths.data.changefilesDir, filename));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(202).json();
}

module.exports = {
  getChangefiles,
  uploadChangefile,
  deleteChangefile,
};
