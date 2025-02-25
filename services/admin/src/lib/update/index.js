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
// TODO 2025-02-19 mail if error
async function downloadSnapshotProcess() {
  setStatus(true);

  appLogger.info('[job][snapshot][download]: Start download snapshot job');

  await createState({ name: '[snapshot][download]' });

  let filename;
  try {
    filename = await downloadSnapshot();
  } catch (err) {
    appLogger.error('[job][snapshot][download]: Cannot download snapshot');
    await endJobAsError();
    appLogger.error('[job][snapshot][download]: download snapshot job is finished with an error', err);
    return;
  }

  appLogger.info(`[job][snapshot][download]: snapshot [${filename}] is downloaded`);
  await endJobAsSuccess();
  appLogger.info('[job][snapshot][download]: download snapshot job is finish');
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
// TODO 2025-02-19 mail if error
async function downloadInsertSnapshotProcess(jobConfig) {
  setStatus(true);

  appLogger.info('[job][snapshot][download][insert]: Start download insert snapshot job');
  appLogger.info(`[job][snapshot][download][insert]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][snapshot][download][insert]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][snapshot][download][insert]: limit: [${jobConfig.limit}]`);

  await createState({ name: '[snapshot][download][insert]', index: jobConfig.index });

  let filename;

  try {
    filename = await downloadSnapshot();
  } catch (err) {
    appLogger.error('[job][snapshot][download][insert]: Cannot download snapshot');
    await endJobAsError();
    appLogger.error('[job][snapshot][download][insert]: Download insert snapshot job is finished with an error', err);
    return;
  }

  appLogger.info(`[job][snapshot][download][insert]: Snapshot [${filename}] is downloaded`);

  jobConfig.filename = filename;

  try {
    await insertDataUnpaywall(jobConfig);
  } catch (err) {
    appLogger.error(`[job][snapshot][download][insert]: Cannot insert the content of snapshot [${jobConfig.filename}]`);
    await endJobAsError();
    appLogger.error('[job][snapshot][download][insert]: Download insert snapshot job is finished with an error', err);
    return;
  }

  if (jobConfig.cleanFile) {
    await deleteFile(path.resolve(paths.data.snapshotsDir, jobConfig.filename));
  }

  await endJobAsSuccess();

  appLogger.info('[job][snapshot][download][insert]: Download insert snapshot job is finish');
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
// TODO 2025-02-19 mail if error
async function downloadInsertChangefilesProcess(jobConfig) {
  setStatus(true);

  const { interval, startDate, endDate } = jobConfig;

  appLogger.info('[job][changefiles][download][insert]: Start download and insert changefile job');
  appLogger.info(`[job][changefiles][download][insert]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][changefiles][download][insert]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][changefiles][download][insert]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][changefiles][download][insert]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][changefiles][download][insert]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][changefiles][download][insert]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][changefiles][download][insert]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][changefiles][download][insert]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({ name: '[changefiles][download][insert]', index: jobConfig.index });
  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();

  let changefilesInfo;

  try {
    changefilesInfo = await getChangefiles(interval, startDate, endDate);
  } catch (err) {
    appLogger.error('[job][changefiles][download][insert]: Cannot get changefiles', err);
    await endJobAsError();
    appLogger.error('[job][changefiles][download][insert]: Download and insert changefile job is finish with an error', err);
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);

  if (changefilesInfo.length === 0) {
    noChangefileMail(startDate, endDate);
    await endJobAsSuccess();
    appLogger.info('[job][changefiles][download][insert]: Download and insert changefile job is finish');
    return;
  }

  for (let i = 0; i < changefilesInfo.length; i += 1) {
    try {
      await downloadChangefile(changefilesInfo[i], interval);
    } catch (err) {
      appLogger.error(`[job][changefiles][download][insert]: Cannot download changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][changefiles][download][insert]: Download and insert changefile job is finish with an error', err);
      return;
    }

    jobConfig.filename = changefilesInfo[i].filename;

    try {
      await insertDataUnpaywall(jobConfig);
    } catch (err) {
      appLogger.error(`[job][changefiles][download][insert]: Cannot insert changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][changefiles][download][insert]: Download and insert changefile job is finish with an error', err);
      return;
    }

    if (jobConfig.cleanFile) {
      await deleteFile(path.resolve(paths.data.changefilesDir, jobConfig.filename));
    }
  }

  await endJobAsSuccess();
  appLogger.info('[job][changefiles][download][insert]: Download and insert changefile job is finish');
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

  const { type } = jobConfig;

  appLogger.info(`[job][${type}][insert]: Start insert changefile job`);
  appLogger.info(`[job][${type}][insert]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][${type}][insert]: filename: [${jobConfig.filename}]`);
  appLogger.info(`[job][${type}][insert]: offset: [${jobConfig.offset}]`);
  appLogger.info(`[job][${type}][insert]: limit: [${jobConfig.limit}]`);
  appLogger.info(`[job][${type}][insert]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][${type}][insert]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({ name: `[${type}][insert]`, index: jobConfig.index });

  try {
    await insertDataUnpaywall(jobConfig);
  } catch (err) {
    appLogger.error(`[job][${type}][insert]: Cannot insert changefile [${jobConfig.filename}]`);
    await endJobAsError();
    appLogger.error(`[job][${type}][insert]: Insert changefile job is finish with an error`, err);
    return;
  }

  if (jobConfig.cleanFile) {
    if (type === 'changefile') {
      await deleteFile(path.resolve(paths.data.changefilesDir, jobConfig.filename));
    }
    if (type === 'snapshots') {
      await deleteFile(path.resolve(paths.data.snapshotsDir, jobConfig.filename));
    }
  }

  await endJobAsSuccess();
  appLogger.info(`[job][${type}][insert]: Insert changefile job is finish`);
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

  appLogger.info('[job][changefiles][history][download][insert]: Start history download and insert changefile job');
  appLogger.info(`[job][changefiles][history][download][insert]: index: [${jobConfig.index}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: indexHistory: [${jobConfig.indexHistory}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: interval: [${jobConfig.interval}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: startDate: [${format(new Date(jobConfig.startDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: endDate: [${format(new Date(jobConfig.endDate), 'yyyy-MM-dd')}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: cleanFile: [${jobConfig.cleanFile}]`);
  appLogger.info(`[job][changefiles][history][download][insert]: ignoreError: [${jobConfig.ignoreError}]`);

  await createState({
    name: '[changefiles][history][download][insert]',
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
    appLogger.error('[job][changefiles][history][download][insert]: Cannot get changefiles', err);
    await endJobAsError();
    appLogger.error('[job][changefiles][history][download][insert]: History download and insert changefile job is finish with an error', err);
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
      appLogger.error(`[job][changefiles][history][download][insert]: Cannot download changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][changefiles][history][download][insert]: History download and insert changefile job is finish with an error', err);
      return;
    }

    jobConfig.filename = changefilesInfo[i].filename;

    try {
      await insertHistoryDataUnpaywall(jobConfig);
    } catch (err) {
      appLogger.error(`[job][changefiles][history][download][insert]: Cannot insert changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError();
      appLogger.error('[job][changefiles][history][download][insert]: History download and insert changefile job is finish with an error', err);
      return;
    }

    if (cleanFile) {
      await deleteFile(path.resolve(paths.data.changefilesDir, changefilesInfo[i].filename));
    }
  }

  await endJobAsSuccess();
  appLogger.info('[job][changefiles][history][download][insert]: History download and insert changefile job is finish');
}

module.exports = {
  downloadSnapshotProcess,
  downloadInsertSnapshotProcess,
  downloadInsertChangefilesProcess,
  insertFileProcess,
  downloadInsertChangefilesHistoryProcess,
};
