/* eslint-disable no-restricted-syntax */
const { createReport } = require('./report');
const { setStatus } = require('./status');
const { updateReportMail } = require('../mail');

const appLogger = require('../logger/appLogger');

let state = {};

function getState() {
  return state;
}

function setState(key, value) {
  state[key] = value;
}

/**
 * Create a new file on folder "data/update/state" containing the update state
 *
 * @return {Promise<string>} name of the file where the state is saved.
 *
 * @param {string} config.type Type of job process.
 * @param {string} config.index index where are inserted data.
 * @param {string} config.indexBase index where are inserted base data.
 * @param {string} config.indexHistory index where are inserted history data.
 */
async function createState(config) {
  appLogger.info(`[state]: create new state for [${config.type}] process`);
  state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
    type: config.type,
    index: config?.index || '',
    indexBase: config?.indexBase || '',
    indexHistory: config?.indexHistory || '',
  };
  appLogger.debug('[state]: state is created');
}

/**
 * Add step "getChangefiles" in steps attributes of state.
 */
function addStepGetChangefiles() {
  appLogger.info('[state]: add step of check unpaywall update file registry');
  const step = {
    task: 'getChangefiles',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  appLogger.debug('[state]: get changefile step is added');
}

/**
 * Add step "download" in steps attributes of state.
 *
 * @param {string} downloadFile Unpaywall data update filename.
 */
function addStepDownload(downloadFile) {
  appLogger.info('[state] add step of download update file from unpaywall');
  const step = {
    task: 'download',
    file: downloadFile,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  appLogger.debug('[state]: download step is added');
}

/**
 * Add step "download" in steps attributes of state.
 *
 * @param {string} downloadFile Unpaywall data update file name.
 */
function addStepInsert(downloadFile) {
  appLogger.info('[state]: add step of insert the content of update file from unpaywall');
  const step = {
    task: 'insert',
    file: downloadFile,
    linesRead: 0,
    addedDocs: 0,
    updatedDocs: 0,
    failedDocs: 0,
    percent: 0,
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
  appLogger.debug('[state]: insert step is added');
}

/**
 * Get the latest step in state.
 */
function getLatestStep() {
  return state.steps[state.steps.length - 1];
}

/**
 * Update latest step in state.
 *
 * @param {Object} step Latest step.
 */
function updateLatestStep(step) {
  state.steps[state.steps.length - 1] = step;
  appLogger.debug('[state]: step is updated');
}

/**
 * Enrich the state by adding the end of treatment attributes.
 */
function end() {
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;

  if (state.type === 'dataUpdate') {
    const indices = [];

    const insertSteps = state.steps.filter((e) => e.task === 'insert');

    let totalAddedDocs = 0;
    let totalUpdatedDocs = 0;

    insertSteps.forEach((step) => {
      totalAddedDocs += step?.addedDocs || 0;
      totalUpdatedDocs += step?.updatedDocs || 0;
    });

    indices.push({
      index: state.index,
      added: totalAddedDocs,
      updated: totalUpdatedDocs,
    });
    state.indices = indices;
  }

  if (state.type === 'dataUpdateHistory') {
    const indices = [];

    const insertSteps = state.steps.filter((e) => e.task === 'insert');

    let totalAddedBase = 0;
    let totalUpdatedBase = 0;
    let totalAddedHistory = 0;
    let totalUpdatedHistory = 0;

    insertSteps.forEach((step) => {
      const keys = Object.keys(step.indices);
      totalAddedBase += step.indices[keys[0]].addedDocs;
      totalUpdatedBase += step.indices[keys[0]].updatedDocs;
      totalAddedHistory += step.indices[keys[1]].addedDocs;
      totalUpdatedHistory += step.indices[keys[1]].updatedDocs;
    });

    indices.push({
      index: state.indexBase,
      added: totalAddedBase,
      updated: totalUpdatedBase,
    });
    indices.push({
      index: state.indexHistory,
      added: totalAddedHistory,
      updated: totalUpdatedHistory,
    });
    state.indices = indices;
  }
  delete state.index;
  delete state.indexBase;
  delete state.indexHistory;
}

/**
 * Update the state when there is an error.
 *
 * @param {Promise<Array<string>>} stackTrace Log of error.
 */
async function fail(stackTrace) {
  appLogger.error('[state]: fail');
  end();
  state.error = true;
  state.stackTrace = stackTrace;
  await createReport(state);
  updateReportMail(state);
  setStatus(false);
}

/**
 * Update the state when the process is finished successfully.
 *
 * @returns {Promise<void>}
 */
async function endState() {
  appLogger.info('[state]: end process');
  end();
  await createReport(state);
  setStatus(false);
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
