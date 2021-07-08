const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');

const { logger } = require('../lib/logger');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');

/**
 * create a new file on folder "out/update/state" containing the update state
 * @return {string} name of the file where the state is saved
 */
const createState = async () => {
  const state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
  };
  const filename = `${uuid.v4()}.json`;
  try {
    await fs.writeFile(path.resolve(statesDir, filename), JSON.stringify(state, null, 2));
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
  let state = await fs.readFile(path.resolve(statesDir, filename));
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
  const pathfile = path.resolve(statesDir, filename);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`updateStateInFile: ${err}`);
  }
};

/**
 * add step "askUnpaywall" in steps attributes of state
 * @param {string} filename - name of the file where the state is saved
 */
const addStepAskUnpaywall = async (filename) => {
  const state = await getState(filename);
  logger.info('step - ask unpaywall');
  const step = {
    task: 'askUnpaywall',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, filename);
};

/**
 * add step "download" in steps attributes of state
 * @param {string} filename - name of the file where the state is saved
 * @param {string} downloadFile - unpaywall data update file name
 */
const addStepDownload = async (filename, downloadFile) => {
  const state = await getState(filename);
  logger.info('step - download file');
  const step = {
    task: 'download',
    file: downloadFile,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, filename);
};

/**
 * add step "download" in steps attributes of state
 * @param {string} filename - name of the file where the state is saved
 * @param {string} downloadFile - unpaywall data update file name
 */
const addStepInsert = async (filename, downloadFile) => {
  const state = await getState(filename);
  logger.info('step - insert file');
  const step = {
    task: 'insert',
    file: downloadFile,
    linesRead: 0,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, filename);
};

/**
 * update the state when there is an error
 * @param {string} filename - name of the file where the state is saved
 */
const fail = async (filename) => {
  const state = await getState(filename);
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;
  state.error = true;
  await updateStateInFile(state, filename);
};

/**
 * update the state when the process is finished
 * @param {string} filename - name of the file where the state is saved
 */
const endState = async (filename) => {
  const state = await getState(filename);
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;
  state.error = false;
  await updateStateInFile(state, filename);
};

module.exports = {
  createState,
  getState,
  updateStateInFile,
  addStepAskUnpaywall,
  addStepDownload,
  addStepInsert,
  fail,
  endState,
};
