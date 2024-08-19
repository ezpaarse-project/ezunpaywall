/* eslint-disable no-param-reassign */
const path = require('path');
const { format } = require('date-fns');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');
const { setStatus } = require('./status');
const { downloadSnapshot, downloadChangefile } = require('./download');
const { noChangefileMail } = require('../mail');

const {
  endState,
  fail,
  createState,
  addStepGetChangefiles,
  updateLatestStep,
  getLatestStep,
} = require('./state');

const insertDataUnpaywall = require('./insert');

const { deleteFile } = require('../files');

const { insertHistoryDataUnpaywall } = require('./history');

const { getChangefiles } = require('../unpaywall/api');

/**
 * Download the current snapshot of unpaywall and insert his content.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.index Name of the index to which the data will be inserted.
 * @param {number} jobConfig.offset Line of the snapshot at which the data insertion starts.
 * @param {number} jobConfig.limit Line in the file where the insertion stops.
 *
 * @returns {Promise<void>}
 */
async function downloadSnapshotProcess() {
  setStatus(true);
  appLogger.info('[job][snapshot]: Start download snapshot job');
  await createState({ type: 'download' });
  const filename = await downloadSnapshot();
  if (!filename) {
    await fail();
    return;
  }
  await endState();
}

/**
 * Download the current snapshot of unpaywall and insert his content.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.index Name of the index to which the data will be inserted.
 * @param {number} jobConfig.offset Line of the snapshot at which the data insertion starts.
 * @param {number} jobConfig.limit Line in the file where the insertion stops.
 *
 * @returns {Promise<void>}
 */
async function downloadAndInsertSnapshotProcess(jobConfig) {
  setStatus(true);
  appLogger.info('[job][snapshot]: Start snapshot job');
  appLogger.info(`[job][snapshot]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][snapshot]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][snapshot]: limit: [${jobConfig.limit}]`);
  await createState({ type: 'dataUpdate', index: jobConfig.index });
  const filename = await downloadSnapshot();
  if (!filename) {
    await fail();
    return;
  }
  jobConfig.filetype = 'snapshot';
  jobConfig.filename = filename;
  await insertDataUnpaywall(jobConfig);
  await endState();
}

/**
 * Download and insert on elastic the changefiles from unpaywall between a period.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.index Name of the index to which the data will be inserted.
 * @param {string} jobConfig.interval Interval of changefile, day or week are available.
 * @param {string} jobConfig.startDate Start date for the changefile period.
 * @param {string} jobConfig.endDate End date for the changefile period.
 * @param {number} jobConfig.offset Line of the snapshot at which the data insertion starts.
 * @param {number} jobConfig.limit Line in the file where the insertion stops.
 * @param {boolean} jobConfig.cleanFile Delete file after job.
 * @param {boolean} jobConfig.ignoreError Ignore error in file.
 *
 * @returns {Promise<void>}
 */
async function insertChangefilesOnPeriodProcess(jobConfig) {
  setStatus(true);
  const { interval, startDate, endDate } = jobConfig;
  appLogger.info('[job][period]: Start period job');
  appLogger.info(`[job][period]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][period]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][period]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][period]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][period]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][period]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][period]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][period]: ignoreError: [${jobConfig.ignoreError}]`);
  await createState({ type: 'dataUpdate', index: jobConfig.index });
  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();
  const changefilesInfo = await getChangefiles(interval, startDate, endDate);

  if (!changefilesInfo) {
    step.status = 'error';
    updateLatestStep(step);
    await fail();
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);

  if (changefilesInfo.length === 0) {
    noChangefileMail(startDate, endDate);
    await endState();
    return;
  }

  let success = true;
  for (let i = 0; i < changefilesInfo.length; i += 1) {
    success = await downloadChangefile(changefilesInfo[i], interval);
    if (!success) return;
    jobConfig.filename = changefilesInfo[i].filename;
    success = await insertDataUnpaywall(jobConfig);
    if (!success) return;
  }
  await endState();
}

/**
 * Insert on elastic the content of file installed on ezunpaywall.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.index Name of the index to which the data will be inserted.
 * @param {string} jobConfig.filename Filename.
 * @param {number} jobConfig.offset Line of the snapshot at which the data insertion starts.
 * @param {number} jobConfig.limit Line in the file where the insertion stops.
 * @param {boolean} jobConfig.cleanFile Delete file after job.
 * @param {boolean} jobConfig.ignoreError Ignore error in file.
 *
 * @returns {Promise<void>}
 */
async function insertChangefileProcess(jobConfig) {
  setStatus(true);
  appLogger.info(`[job][${jobConfig.type}]: Start file job`);
  appLogger.info(`[job][${jobConfig.type}]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][${jobConfig.type}]: filename: [${jobConfig.filename}]`);
  appLogger.info(`[job][${jobConfig.type}]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][${jobConfig.type}]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][${jobConfig.type}]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][${jobConfig.type}]: ignoreError: [${jobConfig.ignoreError}]`);
  await createState({ type: 'dataUpdate', index: jobConfig.index });
  const success = await insertDataUnpaywall(jobConfig);
  if (success) {
    await endState();
  }
}

/**
 * Download and insert on elastic the changefiles from unpaywall between a period with history.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.indexBase Name of the index to which the data will be inserted.
 * @param {string} jobConfig.indexHistory Name of the index to which the data will be inserted.
 * @param {string} jobConfig.interval Interval of changefile, day or week are available.
 * @param {string} jobConfig.startDate Start date for the changefile period.
 * @param {string} jobConfig.endDate End date for the changefile period.
 * @param {boolean} jobConfig.cleanFile Delete file after job.
 * @param {boolean} jobConfig.ignoreError Ignore error in file.
 *
 * @returns {Promise<void>}
 */
async function insertWithOaHistoryProcess(jobConfig) {
  setStatus(true);
  const {
    interval, startDate, endDate, cleanFile,
  } = jobConfig;
  appLogger.info('[job][history]: Start history job');
  appLogger.info(`[job][history]: indexBase: [${jobConfig.indexBase}]`);
  appLogger.info(`[job][history]: indexHistory: [${jobConfig.indexHistory}]`);
  appLogger.info(`[job][history]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][history]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][history]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][history]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][history]: ignoreError: [${jobConfig.ignoreError}]`);
  await createState({ type: 'dataUpdateHistory', indexBase: jobConfig.indexBase, indexHistory: jobConfig.indexHistory });
  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();
  const changefilesInfo = await getChangefiles(interval, startDate, endDate);

  if (!changefilesInfo) {
    step.status = 'error';
    updateLatestStep(step);
    await fail();
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);

  if (changefilesInfo.length === 0) {
    noChangefileMail(startDate, endDate);
    await endState();
    return;
  }

  let success = true;
  for (let i = 0; i < changefilesInfo.length; i += 1) {
    success = await downloadChangefile(changefilesInfo[i], interval);
    if (!success) return;
    jobConfig.filename = changefilesInfo[i].filename;
    success = await insertHistoryDataUnpaywall(jobConfig);
    if (cleanFile) {
      await deleteFile(path.resolve(paths.data.changefilesDir, changefilesInfo[i].filename));
    }
    if (!success) return;
  }
  await endState();
}

module.exports = {
  downloadSnapshotProcess,
  downloadAndInsertSnapshotProcess,
  insertChangefilesOnPeriodProcess,
  insertChangefileProcess,
  insertWithOaHistoryProcess,
};
