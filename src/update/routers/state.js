const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');

const {
  getMostRecentFile,
} = require('../lib/file');

const {
  getState,
} = require('../bin/state');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');
const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

/**
 * get the most recent state in JSON format
 * @apiSuccess state
 */
router.get('/state', async (req, res, next) => {
  const { latest } = req.query;
  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(statesDir);
    } catch (err) {
      return next(err);
    }
    let state;
    try {
      state = await getState(latestFile?.filename);
    } catch (err) {
      return next(err);
    }
    return res.status(200).json({ state });
  }
  const states = await fs.readdir(statesDir);
  return res.status(200).json(states);
});

/**
 * get state in JSON format
 *
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @apiSuccess state
 */
router.get('/state/:filename', async (req, res, next) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'File not found' });
  }

  let state;
  try {
    state = await getState(filename);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ state });
});

module.exports = router;
