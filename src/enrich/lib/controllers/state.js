const path = require('path');
const fs = require('fs-extra');

const { getMostRecentFile } = require('../file');

const { getState } = require('../models/state');

const statesDir = path.resolve(__dirname, '..', '..', 'data', 'states');

async function getStates(req, res, next) {
  const apikey = req.get('x-api-key');

  const latest = req.data;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(path.resolve(statesDir, apikey));
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
    states = await fs.readdir(path.resolve(statesDir, apikey));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(200).json(states);
}

async function getStateByFilename(req, res, next) {
  const filename = req.data;

  const apikey = req.get('x-api-key');

  let fileExist = false;
  try {
    fileExist = await fs.exists(path.resolve(statesDir, apikey, filename));
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
}

module.exports = {
  getStates,
  getStateByFilename,
};
