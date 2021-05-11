const path = require('path');
const fs = require('fs-extra');
const uuid = require('uuid');
const { logger } = require('../../lib/logger');

const stateDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'state');

/**
 * @param {*} fileName - state file name
 * @returns {Object} state
 */
const getState = async (fileName) => {
  let state = await fs.readFile(path.resolve(stateDir, fileName));
  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`getState on JSON.parse: ${err}`);
  }
  return state;
};

/**
 * write the latest version of the state to the file
 */
const updateStateInFile = async (state, fileName) => {
  const pathfile = path.resolve(stateDir, fileName);
  const isPathExist = await fs.pathExists(pathfile);
  if (!isPathExist) {
    logger.error(`updateStateInFile on fs.pathExists: file ${pathfile} doesn't exist`);
  } else {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  }
};

/**
 * create a new file containing the update status
 * @return {String} name of file
 */
const createState = async () => {
  const state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
  };
  const fileName = `${uuid.v4()}.json`;
  try {
    await fs.writeFile(path.resolve(stateDir, fileName), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createState: ${err}`);
  }
  return fileName;
};

/**
 * add step "askUnpaywall" on steps attributes of state
 * @param {string} fileName - name of file name of state
 */
const addStepAskUnpaywall = async (fileName) => {
  const state = await getState(fileName);
  logger.info('step - ask unpaywall');
  const step = {
    task: 'askUnpaywall',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, fileName);
};

/**
 * add step "download" on steps attributes of state
 * @param {string} fileName - state file name
 * @param {string} downloadFile - unpaywall data update file name
 */
const addStepDownload = async (fileName, downloadFile) => {
  const state = await getState(fileName);
  logger.info('step - download file');
  const step = {
    task: 'download',
    file: downloadFile,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, fileName);
};

/**
 * add step "download" on steps attributes of state
 * @param {string} fileName - state file name
 * @param {string} downloadFile - unpaywall data update file name
 */
const addStepInsert = async (fileName, downloadFile) => {
  const state = await getState(fileName);
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
  await updateStateInFile(state, fileName);
};

const fail = async (fileName) => {
  const state = await getState(fileName);
  state.done = true;
  state.endAt = new Date();
  state.error = true;
  await updateStateInFile(state, fileName);
};

const endState = async (fileName) => {
  const state = await getState(fileName);
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;
  state.error = false;
  await updateStateInFile(state, fileName);
};

module.exports = {
  getState,
  updateStateInFile,
  createState,
  addStepAskUnpaywall,
  addStepDownload,
  addStepInsert,
  fail,
  endState,
};
