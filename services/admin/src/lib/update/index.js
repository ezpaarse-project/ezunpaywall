/* eslint-disable no-param-reassign */
const path = require('path');
const { format } = require('date-fns');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');

const { setStatus } = require('./status');
const { createReport } = require('./report');

const { downloadSnapshot, downloadChangefile } = require('./download');
const { noChangefileMail } = require('../mail');

const {
  getState,
  end,
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

async function endJobAsError() {
  await fail();
  const state = getState();
  await createReport(state);
  setStatus(false);
}

async function endJobAsSuccess() {
  await end();
  const state = getState();
  await createReport(state);
  setStatus(false);
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
// TODO mail if error
async function downloadSnapshotProcess() {
  setStatus(true);

  appLogger.info('[job][download][snapshot]: Start download snapshot job');

  await createState({ name: '[download][snapshot]' });

  let filename;
  try {
    filename = await downloadSnapshot();
  } catch (err) {
    appLogger.error('[job][download][snapshot]: Cannot download snapshot');
    await endJobAsError();
    appLogger.error('[job][download][snapshot]: download snapshot job is finished with an error', err);
    return;
  }

  appLogger.info(`[job][download][snapshot]: snapshot [${filename}] is downloaded`);
  await endJobAsSuccess();
  appLogger.info('[job][download][snapshot]: download snapshot job is finish');
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
// TODO mail if error
async function downloadAndInsertSnapshotProcess(jobConfig) {
  setStatus(true);

  appLogger.info('[job][download][insert][snapshot]: Start download insert snapshot job');
  appLogger.info(`[job][download][insert][snapshot]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][download][insert][snapshot]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][download][insert][snapshot]: limit: [${jobConfig.limit}]`);

  await createState({ name: '[download][insert][snapshot]', index: jobConfig.index });

  let filename;

  try {
    filename = await downloadSnapshot();
  } catch (err) {
    appLogger.error('[job][download][insert][snapshot]: Cannot download snapshot');
    await endJobAsError();
    appLogger.error('[job][download][insert][snapshot]: Download insert snapshot job is finished with an error', err);
    return;
  }

  appLogger.info(`[job][download][insert][snapshot]: Snapshot [${filename}] is downloaded`);

  jobConfig.filename = filename;

  try {
    await insertDataUnpaywall(jobConfig);
  } catch (err) {
    appLogger.error(`[job][download][insert][snapshot]: Cannot insert the content of snapshot [${jobConfig.filename}]`);
    await endJobAsError();
    appLogger.error('[job][download][insert][snapshot]: Download insert snapshot job is finished with an error', err);
    return;
  }

  await endJobAsSuccess();

  appLogger.info('[job][download][insert][snapshot]: Download insert snapshot job is finish');
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
// TODO mail if error
async function downloadInsertChangefilesProcess(jobConfig) {
  setStatus(true);

  const { interval, startDate, endDate } = jobConfig;

  appLogger.info('[job][download][insert][changefile]: Start download and insert changefile job');
  appLogger.info(`[job][download][insert][changefile]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][download][insert][changefile]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][download][insert][changefile]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][download][insert][changefile]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][download][insert][changefile]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][download][insert][changefile]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][download][insert][changefile]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][download][insert][changefile]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({ name: '[download][insert][changefile]', index: jobConfig.index });
  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();

  let changefilesInfo;

  try {
    changefilesInfo = await getChangefiles(interval, startDate, endDate);
  } catch (err) {
    appLogger.error('[job][download][insert][changefile]: Cannot get changefiles', err);
    await endJobAsError();
    appLogger.error('[job][download][insert][changefile]: Download and insert changefile job is finish with an error', err);
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);

  if (changefilesInfo.length === 0) {
    noChangefileMail(startDate, endDate);
    await endJobAsSuccess();
    appLogger.info('[job][download][insert][changefile]: Download and insert changefile job is finish');
    return;
  }

  for (let i = 0; i < changefilesInfo.length; i += 1) {
    try {
      await downloadChangefile(changefilesInfo[i], interval);
    } catch (err) {
      appLogger.error(`[job][download][insert][changefile]: Cannot download changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][download][insert][changefile]: Download and insert changefile job is finish with an error', err);
      return;
    }

    jobConfig.filename = changefilesInfo[i].filename;

    try {
      await insertDataUnpaywall(jobConfig);
    } catch (err) {
      appLogger.error(`[job][download][insert][changefile]: Cannot insert changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][download][insert][changefile]: Download and insert changefile job is finish with an error', err);
      return;
    }
  }

  await endJobAsSuccess();
  appLogger.info('[job][download][insert][changefile]: Download and insert changefile job is finish');
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
async function insertFileProcess(jobConfig) {
  setStatus(true);

  appLogger.info(`[job][insert][${jobConfig.type}]: Start insert changefile job`);
  appLogger.info(`[job][insert][${jobConfig.type}]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][insert][${jobConfig.type}]: filename: [${jobConfig.filename}]`);
  appLogger.info(`[job][insert][${jobConfig.type}]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][insert][${jobConfig.type}]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][insert][${jobConfig.type}]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][insert][${jobConfig.type}]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({ name: `[insert][${jobConfig.type}]`, index: jobConfig.index });

  try {
    await insertDataUnpaywall(jobConfig);
  } catch (err) {
    appLogger.error(`[job][insert][${jobConfig.type}]: Cannot insert changefile [${jobConfig.filename}]`);
    await endJobAsError();
    appLogger.error(`[job][insert][${jobConfig.type}]: Insert changefile job is finish with an error`, err);
    return;
  }

  await endJobAsSuccess();
  appLogger.info(`[job][insert][${jobConfig.type}]: Insert changefile job is finish`);
}

/**
 * Download and insert on elastic the changefiles from unpaywall between a period with history.
 *
 * @param {Object} jobConfig Config of job.
 * @param {string} jobConfig.index Name of the index to which the data will be inserted.
 * @param {string} jobConfig.indexHistory Name of the index to which the data will be inserted.
 * @param {string} jobConfig.interval Interval of changefile, day or week are available.
 * @param {string} jobConfig.startDate Start date for the changefile period.
 * @param {string} jobConfig.endDate End date for the changefile period.
 * @param {boolean} jobConfig.cleanFile Delete file after job.
 * @param {boolean} jobConfig.ignoreError Ignore error in file.
 *
 * @returns {Promise<void>}
 */
async function downloadInsertChangefilesHistoryProcess(jobConfig) {
  setStatus(true);

  const {
    interval,
    startDate,
    endDate,
    cleanFile,
  } = jobConfig;

  appLogger.info('[job][history][download][insert][changefile]: Start history download and insert changefile job');
  appLogger.info(`[job][history][download][insert][changefile]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][history][download][insert][changefile]: indexHistory: [${jobConfig.indexHistory}]`);
  appLogger.info(`[job][history][download][insert][changefile]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][history][download][insert][changefile]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][history][download][insert][changefile]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][history][download][insert][changefile]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][history][download][insert][changefile]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({
    name: '[history][download][insert][changefile]',
    index: jobConfig.index,
    indexHistory: jobConfig.indexHistory,
  });

  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();

  let changefilesInfo;

  try {
    changefilesInfo = await getChangefiles(interval, startDate, endDate);
  } catch (err) {
    appLogger.error('[job][history][download][insert][changefile]: Cannot get changefiles', err);
    await endJobAsError();
    appLogger.error('[job][history][download][insert][changefile]: History download and insert changefile job is finish with an error', err);
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);

  if (changefilesInfo.length === 0) {
    await endJobAsSuccess();
    noChangefileMail(startDate, endDate);
    return;
  }

  for (let i = 0; i < changefilesInfo.length; i += 1) {
    try {
      await downloadChangefile(changefilesInfo[i], interval);
    } catch (err) {
      appLogger.error(`[job][history][download][insert][changefile]: Cannot download changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][history][download][insert][changefile]: History download and insert changefile job is finish with an error', err);
      return;
    }

    jobConfig.filename = changefilesInfo[i].filename;

    try {
      await insertHistoryDataUnpaywall(jobConfig);
    } catch (err) {
      appLogger.error(`[job][history][download][insert][changefile]: Cannot insert changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][history][download][insert][changefile]: History download and insert changefile job is finish with an error', err);
      return;
    }

    if (cleanFile) {
      await deleteFile(path.resolve(paths.data.changefilesDir, changefilesInfo[i].filename));
    }
  }

  await endJobAsSuccess();
  appLogger.info('[job][history][download][insert][changefile]: History download and insert changefile job is finish');
}

module.exports = {
  downloadSnapshotProcess,
  downloadAndInsertSnapshotProcess,
  downloadInsertChangefilesProcess,
  insertFileProcess,
  downloadInsertChangefilesHistoryProcess,
};
