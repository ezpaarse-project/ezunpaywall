const router = require('express').Router();
const { paths } = require('config');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

const checkApiKey = require('../middlewares/user');
const validateLatest = require('../middlewares/latest');
const validateFilename = require('../middlewares/filename');
const upsertDirectoryOfUser = require('../middlewares/state');

const { getMostRecentFile } = require('../lib/file');
const { getState } = require('../models/state');

/**
 * Route that give list of filename of state or the content of latest state.
 *
 * This route can take in query latest.
 */
router.get('/states', checkApiKey, validateLatest, upsertDirectoryOfUser, async (req, res, next) => {
  const apikey = req.get('x-api-key');
  const latest = req.data;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(path.resolve(paths.data.statesDir, apikey));
    } catch (err) {
      return next({ message: err.message });
    }
    let state;
    try {
      state = await getState(latestFile?.filename, apikey);
    } catch (err) {
      return next({ message: err.message });
    }
    return res.status(200).json(state);
  }

  let states;
  try {
    states = await fsp.readdir(path.resolve(paths.data.statesDir, apikey));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(200).json(states);
});

/**
 * Route that give the content of state.
 *
 * This route need a param which corresponds to the filename of state.
 */
router.get('/states/:filename', checkApiKey, validateFilename, upsertDirectoryOfUser, async (req, res, next) => {
  const filename = req.data;
  const apikey = req.get('x-api-key');

  let fileExist = false;
  try {
    fileExist = await fs.existsSync(path.resolve(paths.data.statesDir, apikey, filename));
  } catch (err) {
    return next({ message: err.message });
  }

  if (!fileExist) {
    return res.status(404).json({ message: `State [${filename}] for [${apikey}] not found` });
  }

  let state;
  try {
    state = await getState(filename, apikey);
  } catch (err) {
    return next({ message: err.message });
  }
  return res.status(200).json(state);
});

module.exports = router;
