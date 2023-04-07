const {
  createReport,
} = require('../controllers/report');

const {
  sendMailUpdateReport,
} = require('../services/mail');

const {
  setInUpdate,
} = require('../controllers/status');

const logger = require('../logger');

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
 */
async function createState() {
  state = {
    done: false,
    createdAt: new Date(),
    endAt: null,
    steps: [],
    error: false,
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
