const path = require('path');
const fs = require('fs-extra');

const { logger } = require('../../lib/logger');

const stateDir = path.resolve(__dirname, '..', '..', 'out', 'enrich', 'state');

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
    logger.error(`createState: ${err}`);
  }
};

/**
 * get state from the folder "out/enrich/state"
 * @param {string} id - id of process
 * @returns {object} - state in JSON format
 */
const getState = async (id) => {
  let state = await fs.readFile(path.resolve(stateDir, `${id}.json`));
  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`getState on JSON.parse: ${err}`);
  }
  return state;
};

/**
 * write the latest version of the state to the file
 * @param {object} state - state in JSON format
 * @param {object} id - id of process
 */
const updateStateInFile = async (state, id) => {
  const pathfile = path.resolve(stateDir, `${id}.json`);
  const isPathExist = await fs.pathExists(pathfile);
  if (!isPathExist) {
    logger.error(`updateStateInFile on fs.pathExists: file ${pathfile} doesn't exist`);
  } else {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  }
};

/**
 * update the state when there is an error
 * @param {string} id - id of process
 */
const fail = async (id) => {
  const state = await getState(id);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state, id);
};

/**
 * update the state when the process is finished
 * @param {string} id - id of process
 */
const endState = async (id) => {
  const state = await getState(id);
  state.endAt = new Date();
  state.done = true;
  updateStateInFile(state, id);
};

module.exports = {
  createState,
  getState,
  updateStateInFile,
  fail,
  endState,
};
