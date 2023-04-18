const path = require('path');
const fs = require('fs-extra');

const logger = require('../logger');

const stateDir = path.resolve(__dirname, '..', '..', 'data', 'states');

/**
 * Create a new State in file on folder data/state/<apikey>/<id>.json
 * containing the enrich state.
 *
 * @param {string} id - Id of process.
 * @param {string} apikey - Apikey of user.
 *
 * @returns {Promise<void>}
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
    logger.error(`[state]: Cannot write [${JSON.stringify(state, null, 2)}] in [${filenamePath}]`, err);
    throw err;
  }
}

/**
 * Get the content of state from a file in the folder data/state/<apikey>/<filename>.
 *
 * @param {string} filename - State filename.
 * @param {string} apikey - Apikey of user.
 *
 * @returns {Promise<Object>} State of enrich process in JSON format.
 */
async function getState(filename, apikey) {
  const filenamePath = path.resolve(stateDir, apikey, filename);

  let state;

  try {
    state = await fs.readFile(filenamePath, 'utf8');
  } catch (err) {
    logger.error(`[state]: Cannot read ["${filenamePath}"] file`, err);
    throw err;
  }

  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`[state]: Cannot parse [${state}] in json format`, err);
    throw err;
  }

  return state;
}

/**
 * Write the latest version of the state of enrich process to the file.
 *
 * @param {Object} state - State in JSON format.
 * @param {string} filename - State filename.
 *
 * @returns {Promise<void>}
 */
async function updateStateInFile(state, filename) {
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
    logger.error(`[state]: Cannot write ${JSON.stringify(state, null, 2)} in ${pathfile}`, err);
    throw err;
  }
}

/**
 * Update the state of enrich process when there is an error.
 *
 * @param {string} filename - State filename.
 * @param {string} apikey - Apikey of user.
 *
 * @returns {Promise<void>}
 */
async function fail(filename, apikey) {
  const state = await getState(filename, apikey);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state, filename);
}

/**
 * Update the state of enrich process when the process is finished.
 *
 * @param {string} id - Id of process.
 * @param {string} apikey - Apikey of user
 *
 * @returns {Promise<void>}.
 */
async function endState(id, apikey) {
  const state = await getState(`${id}.json`, apikey);
  state.endAt = new Date();
  state.done = true;
  updateStateInFile(state, `${id}.json`);
}

module.exports = {
  createState,
  getState,
  updateStateInFile,
  fail,
  endState,
};
