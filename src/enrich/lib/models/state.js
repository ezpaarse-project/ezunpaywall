/* eslint-disable no-param-reassign */
const path = require('path');
const fs = require('fs-extra');
const { paths } = require('config');

const logger = require('../logger/appLogger');

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
  const filename = `${id}.json`;
  const filenamePath = path.resolve(paths.data.statesDir, apikey, filename);

  const state = {
    id,
    path: filenamePath,
    filename,
    apikey,
    done: false,
    loaded: 0,
    linesRead: 0,
    enrichedLines: 0,
    createdAt: new Date(),
    endAt: null,
    error: false,
  };

  const dir = path.resolve(paths.data.statesDir, apikey);

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
  return state;
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
  const filenamePath = path.resolve(paths.data.statesDir, apikey, filename);

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
 * @param {Object} state - State of job.
 *
 * @returns {Promise<void>}
 */
async function updateStateInFile(state) {
  try {
    await fs.writeFile(state.path, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[state]: Cannot write ${JSON.stringify(state, null, 2)} in ${state.path}`, err);
    throw err;
  }
}

/**
 * Update the state of enrich process when there is an error.
 *
 * @param {Object} state - State of job.
 *
 * @returns {Promise<void>}
 */
async function fail(state) {
  logger.info(`[state]: job fail with id [${state.id}]`);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state);
}

/**
 * Update the state of enrich process when the process is finished.
 *
 * @param {string} id - Id of process.
 * @param {string} apikey - Apikey of user
 *
 * @returns {Promise<void>}.
 */
async function endState(state) {
  state.endAt = new Date();
  state.done = true;
  updateStateInFile(state);
}

module.exports = {
  createState,
  getState,
  updateStateInFile,
  fail,
  endState,
};
