const path = require('path');
const fs = require('fs-extra');

const {
  createReport,
} = require('./report');

const {
  sendMailReport,
} = require('../lib/mail');

const {
  setInUpdate,
} = require('./status');

const logger = require('../lib/logger');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');

/**
 * create a new file on folder "out/update/state" containing the update state
 * @return {String} name of the file where the state is saved
 */
const createState = async () => {
  const state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
  };
  const filename = `${new Date().toISOString()}.json`;
  try {
    await fs.writeFile(path.resolve(statesDir, filename), JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(state, null, 2)} in ${path.resolve(statesDir, filename)}`);
    logger.error(err);
  }
  return filename;
};

/**
 * get state from the folder "out/enrich/state"
 * @param {String} filename - state filename
 * @returns {Object} - state in JSON format
 */
const getState = async (filename) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(statesDir, filename), 'utf-8');
  } catch (err) {
    logger.error(`Cannot read "${path.resolve(statesDir, filename)}"`);
  }

  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`Cannot parse "${state}" in json format`);
    logger.error(err);
  }
  return state;
};

/**
 * write the latest version of the state to the file
 * @param {Object} state - state in JSON format
 * @param {Object} filename - name of the file where the state is saved
 */
const updateStateInFile = async (state, filename) => {
  const filepath = path.resolve(statesDir, filename);
  try {
    await fs.writeFile(filepath, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(state, null, 2)} in ${filepath}`);
    logger.error(err);
  }
};

/**
 * add step "getChangefiles" in steps attributes of state
 * @param {String} filename - name of the file where the state is saved
 */
const addStepGetChangefiles = async (filename) => {
  const state = await getState(filename);
  logger.info('step - ask unpaywall');
  const step = {
    task: 'getChangefiles',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, filename);
};

/**
 * add step "download" in steps attributes of state
 * @param {String} filename - name of the file where the state is saved
 * @param {String} downloadFile - unpaywall data update file name
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
 * @param {String} filename - name of the file where the state is saved
 * @param {String} downloadFile - unpaywall data update file name
 */
const addStepInsert = async (filename, downloadFile) => {
  const state = await getState(filename);
  logger.info('step - insert file');
  const step = {
    task: 'insert',
    index: 'unpaywall',
    file: downloadFile,
    linesRead: 0,
    insertedDocs: 0,
    updatedDocs: 0,
    failedDocs: 0,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  await updateStateInFile(state, filename);
};

/**
 * get the latest step in state
 * @param {String} filename - name of the file where the state is saved
 */
const getLatestStep = async (filename) => {
  const state = await getState(filename);
  return state.steps[state.steps.length - 1];
};

const updateLatestStep = async (filename, step) => {
  const state = await getState(filename);
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, filename);
  return step;
};

/**
 * update the state when there is an error
 * @param {String} filename - name of the file where the state is saved
 * @param {Array<String>} stackTrace - log of error
 */
const fail = async (filename, stackTrace) => {
  const state = await getState(filename);
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;
  state.error = true;
  state.stackTrace = stackTrace;
  await updateStateInFile(state, filename);
  await createReport(state);
  setInUpdate(false);
  await sendMailReport(state);
};

/**
 * update the state when the process is finished
 * @param {String} filename - name of the file where the state is saved
 */
const endState = async (filename) => {
  const state = await getState(filename);
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;
  await updateStateInFile(state, filename);
  await createReport(state);
  await sendMailReport(state);
  setInUpdate(false);
};

module.exports = {
  createState,
  getState,
  updateStateInFile,
  addStepGetChangefiles,
  addStepDownload,
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
  endState,
};
