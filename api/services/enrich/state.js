const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');

const { logger } = require('../../lib/logger');

const stateDir = path.resolve(__dirname, '..', '..', 'out', 'enrich', 'state');

/**
 * create a new file on folder "out/enrich/state" containing the enrich state
 * @return {string} name of the file where the state is saved
 */
const createState = async () => {
  const state = {
    done: false,
    loaded: 0,
    linesRead: 0,
    enrichedLines: 0,
    createdAt: Date.now(),
    endAt: null,
    error: false,
  };
  const filename = `${uuid.v4()}.json`;
  try {
    await fs.writeFileSync(path.resolve(stateDir, filename), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createState: ${err}`);
  }
  return filename;
};

/**
 * get state from the folder "out/enrich/state"
 * @param {string} filename - state filename
 * @returns {object} - state in JSON format
 */
const getState = async (filename) => {
  let state = await fs.readFile(path.resolve(stateDir, filename));
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
 * @param {object} filename - name of the file where the state is saved
 */
const updateStateInFile = async (state, filename) => {
  const pathfile = path.resolve(stateDir, filename);
  const isPathExist = await fs.pathExists(pathfile);
  if (!isPathExist) {
    logger.error(`updateStateInFile on fs.pathExists: file ${pathfile} doesn't exist`);
  } else {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  }
};

/**
 * update the state when there is an error
 * @param {string} filename - name of the file where the state is saved
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
 * @param {string} filename - name of the file where the state is saved
 */
const endState = async (filename) => {
  const state = await getState(filename);
  state.endAt = Date.now();
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
