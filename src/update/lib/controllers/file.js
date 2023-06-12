const fs = require('fs-extra');
const path = require('path');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

const {
  getMostRecentFile,
  deleteFile,
} = require('../file');

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

async function uploadFile(req, res, next) {
  if (!req?.file) return next({ messsage: 'File not sent' });
  return res.status(202).json();
}

async function deleteFileInstalled(req, res, next) {
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
  deleteFileInstalled,
};
