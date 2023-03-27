const path = require('path');
const fs = require('fs-extra');

const logger = require('../logger');

const stateDir = path.resolve(__dirname, '..', '..', 'data', 'states');

/**
 * Create a new State in file on folder data/state/<apikey>/<id>.json
 * containing the enrich state.
 *
 * @param {String} id - Id of process.
 * @param {String} apikey - Apikey of user.
 */
async function createState(id, apikey) {
  const state = {
    done: false,
    loaded: 0,
    linesRead: 0,
    enrichedLines: 0,
    createdAt: new Date(),
    endAt: null,
    error: false,
    apikey,
  };

  const filename = `${id}.json`;
  const filenamePath = path.resolve(stateDir, apikey, filename);

  const dir = path.resolve(stateDir, apikey);

  const exist = await fs.exists(dir);

  if (!exist) {
    await fs.mkdir(dir);
  }

  try {
    await fs.writeFile(filenamePath, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[state]: Cannot write ${JSON.stringify(state, null, 2)} in ${filenamePath}`);
    logger.error(err);
    throw err;
  }
}

/**
 * Get the content of state from a file in the folder data/state/<apikey>/<filename>.
 *
 * @param {String} filename - State filename.
 * @param {String} apikey - Apikey of user.
 *
 * @returns {Object} State of enrich process in JSON format.
 */
const getState = async (filename, apikey) => {
  const filenamePath = path.resolve(stateDir, apikey, filename);

  let state;

  try {
    state = await fs.readFile(filenamePath, 'utf8');
  } catch (err) {
    logger.error(`[state]: Cannot read "${filenamePath}" file`);
    logger.error(err);
    throw err;
  }

  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`[state]: Cannot parse "${state}" in json format`);
    logger.error(err);
    throw err;
  }

  return state;
};

/**
 * Write the latest version of the state of enrich process to the file.
 *
 * @param {Object} state - State in JSON format.
 * @param {String} filename - State filename.
 */
const updateStateInFile = async (state, filename) => {
  const { apikey } = state;
  const pathfile = path.resolve(stateDir, apikey, filename);
  const isPathExist = await fs.pathExists(pathfile);

  if (!isPathExist) {
    logger.error(`[state]: Cannot update state because ${pathfile} doesn't exist`);
    return;
  }

  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[state]: Cannot write ${JSON.stringify(state, null, 2)} in ${pathfile}`);
  }
};

/**
 * Update the state of enrich process when there is an error.
 *
 * @param {String} filename - State filename.
 * @param {String} apikey - Apikey of user.
 */
const fail = async (filename, apikey) => {
  const state = await getState(filename, apikey);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state, filename);
};

/**
 * Update the state of enrich process when the process is finished.
 *
 * @param {String} id - Id of process.
 * @param {String} apikey - Apikey of user.
 */
const endState = async (id, apikey) => {
  const state = await getState(`${id}.json`, apikey);
  state.endAt = new Date();
  state.done = true;
  updateStateInFile(state, `${id}.json`);
};

module.exports = {
  createState,
  getState,
  updateStateInFile,
  fail,
  endState,
};
