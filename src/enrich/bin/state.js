const path = require('path');
const fs = require('fs-extra');

const logger = require('../lib/logger');

const stateDir = path.resolve(__dirname, '..', 'out', 'states');

/**
 * create a new file on folder "out/enrich/state" containing the enrich state
 * @param {string} id - id of process
 */
const createState = async (id) => {
  const state = {
    done: false,
    loaded: 0,
    linesRead: 0,
    enrichedLines: 0,
    createdAt: new Date(),
    endAt: null,
    error: false,
  };
  const filename = `${id}.json`;
  try {
    await fs.writeFile(path.resolve(stateDir, filename), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(state, null, 2)} in ${path.resolve(stateDir, filename)}`);
    logger.error(err);
  }
};

/**
 * get state from the folder "out/enrich/state"
 * @param {string} filename - state filename
 * @returns {object} - state in JSON format
 */
const getState = async (filename) => {
  let state = await fs.readFile(path.resolve(stateDir, filename), 'utf8');
  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`Cannot parse ${state} in json format`);
    logger.error(err);
  }
  return state;
};

/**
 * write the latest version of the state to the file
 * @param {object} state - state in JSON format
 * @param {string} filename - state filename
 */
const updateStateInFile = async (state, filename) => {
  const pathfile = path.resolve(stateDir, filename);
  const isPathExist = await fs.pathExists(pathfile);
  if (!isPathExist) {
    logger.error(`Cannot update state because ${pathfile} doesn't exist`);
    return;
  }
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(state, null, 2)} in ${pathfile}`);
  }
};

/**
 * update the state when there is an error
 * @param {string} filename - state filename
 */
const fail = async (filename) => {
  const state = await getState(filename);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state, filename);
};

/**
 * update the state when the process is finished
 * @param {string} filename - state filename
 */
const endState = async (filename) => {
  const state = await getState(filename);
  state.endAt = new Date();
  state.done = true;
  updateStateInFile(state, filename);
};

module.exports = {
  createState,
  getState,
  updateStateInFile,
  fail,
  endState,
};
