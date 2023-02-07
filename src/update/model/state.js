const {
  createReport,
} = require('../bin/report');

const {
  sendMailUpdateReport,
} = require('../lib/service/mail');

const {
  setInUpdate,
} = require('../bin/status');

const logger = require('../lib/logger');

let state = {};

function getState() {
  return state;
}

function setState(key, value) {
  state[key] = value;
}

/**
 * create a new file on folder "data/update/state" containing the update state
 * @return {String} name of the file where the state is saved
 */
function createState() {
  state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
  };
}

/**
 * add step "getChangefiles" in steps attributes of state
 */
function addStepGetChangefiles() {
  logger.info('step - ask unpaywall');
  const step = {
    task: 'getChangefiles',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
}

/**
 * add step "download" in steps attributes of state
 * @param {String} downloadFile - unpaywall data update filename
 */
function addStepDownload(downloadFile) {
  logger.info('step - download file');
  const step = {
    task: 'download',
    file: downloadFile,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
}

/**
 * add step "download" in steps attributes of state
 * @param {String} downloadFile - unpaywall data update file name
 */
function addStepInsert(downloadFile) {
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
}

/**
 * get the latest step in state
 */
function getLatestStep() {
  return state.steps[state.steps.length - 1];
}

/**
 * update latest step in state
 * @param {*} step - latest step
 */
function updateLatestStep(step) {
  state.steps[state.steps.length - 1] = step;
}

function end() {
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;

  const insertSteps = state.steps.filter((e) => e.task === 'insert');
  let totalInsertedDocs = 0;
  let totalUpdatedDocs = 0;
  insertSteps.forEach((e) => {
    totalInsertedDocs += e?.insertedDocs || 0;
  });
  state.totalInsertedDocs = totalInsertedDocs;
  insertSteps.forEach((e) => {
    totalUpdatedDocs += e?.updatedDocs || 0;
  });
  state.totalUpdatedDocs = totalUpdatedDocs;
}

/**
 * update the state when there is an error
 * @param {Array<String>} stackTrace - log of error
 */
async function fail(stackTrace) {
  logger.error('[update process]: fail');
  end();
  state.error = true;
  state.stackTrace = stackTrace;
  await createReport(state);
  await sendMailUpdateReport(state);
  setInUpdate(false);
}

/**
 * update the state when the process is finished
 */
async function endState() {
  logger.info('[update process]: end process');
  end();
  await createReport(state);
  setInUpdate(false);
}

module.exports = {
  getState,
  setState,
  createState,
  addStepGetChangefiles,
  addStepDownload,
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
  endState,
};
