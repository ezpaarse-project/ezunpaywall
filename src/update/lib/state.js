/* eslint-disable no-restricted-syntax */
const {
  createReport,
} = require('./report');

const {
  sendMailUpdateReport,
} = require('./services/mail');

const {
  setInUpdate,
} = require('./status');

const logger = require('./logger');

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
 * @param {string} config.type - Type of job process.
 * @param {string} config.index - index where are inserted data.
 * @param {string} config.indexBase - index where are inserted base data.
 * @param {string} config.indexHistory - index where are inserted history data.
 */
async function createState(config) {
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
}

/**
 * Add step "getChangefiles" in steps attributes of state.
 */
function addStepGetChangefiles() {
  logger.info('[job: state] add step of check unpaywall update file registry');
  const step = {
    task: 'getChangefiles',
    took: 0,
    status: 'inProgress',
  };
  state.steps.push(step);
}

/**
 * Add step "download" in steps attributes of state.
 *
 * @param {string} downloadFile - Unpaywall data update filename.
 */
function addStepDownload(downloadFile) {
  logger.info('[job: state] add step of download update file from unpaywall');
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
 * Add step "download" in steps attributes of state.
 *
 * @param {string} downloadFile - Unpaywall data update file name.
 */
function addStepInsert(downloadFile) {
  logger.info('[job: state] add step of insert the content of update file from unpaywall');
  const step = {
    task: 'insert',
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
 * Get the latest step in state.
 */
function getLatestStep() {
  return state.steps[state.steps.length - 1];
}

/**
 * Update latest step in state.
 *
 * @param {Object} step - Latest step.
 */
function updateLatestStep(step) {
  state.steps[state.steps.length - 1] = step;
}

/**
 * Enrich the state by adding the end of treatment attributes.
 */
function end() {
  state.done = true;
  state.endAt = new Date();
  state.took = (new Date(state.endAt) - new Date(state.createdAt)) / 1000;

  if (state.type === 'unpaywall') {
    const insertSteps = state.steps.filter((e) => e.task === 'insert');
    let totalInsertedDocs = 0;
    let totalUpdatedDocs = 0;
    insertSteps.forEach((step) => {
      totalInsertedDocs += step?.insertedDocs || 0;
      totalUpdatedDocs += step?.updatedDocs || 0;
      if (typeof step.index === 'object') {
        const indices = Object.keys(step.index);
        indices.forEach((i) => {
          const data = step.index[i];
          totalInsertedDocs += data.insertedDocs || 0;
          totalUpdatedDocs += data.updatedDocs || 0;
        });
      }
    });
    state.totalInsertedDocs = totalInsertedDocs;
    state.totalUpdatedDocs = totalUpdatedDocs;
  }

  if (state.type === 'unpaywallHistory') {
    let totalInsertBase = 0;
    let totalUpdateBase = 0;
    let totalInsertHistory = 0;
    let totalUpdateHistory = 0;
    const insertSteps = state.steps.filter((e) => e.task === 'insert');
    insertSteps.forEach((step) => {
      const keys = Object.keys(step.index);
      totalInsertBase += step.index[keys[0]].insertedDocs;
      totalUpdateBase += step.index[keys[0]].updatedDocs;
      totalInsertHistory += step.index[keys[1]].insertedDocs;
      totalUpdateHistory += step.index[keys[1]].updatedDocs;
    });
    state.totalBaseInsertedDocs = totalInsertBase;
    state.totalBaseUpdatedDocs = totalUpdateBase;
    state.totalHistoryInsertedDocs = totalInsertHistory;
    state.totalHistoryUpdatedDocs = totalUpdateHistory;
  }
}

/**
 * Update the state when there is an error.
 *
 * @param {Promise<Array<string>>} stackTrace - Log of error.
 */
async function fail(stackTrace) {
  logger.error('[update process]: fail');
  end();
  state.error = true;
  state.stackTrace = stackTrace;
  await createReport(state);
  sendMailUpdateReport(state).catch((err) => {
    logger.errorRequest(err);
  });
  setInUpdate(false);
}

/**
 * Update the state when the process is finished successfully.
 *
 * @returns {Promise<void>}
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
