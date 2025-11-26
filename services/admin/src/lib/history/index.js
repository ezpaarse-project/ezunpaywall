const path = require('path');

const { format } = require('date-fns');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');

const { insertHistoryDataUnpaywall } = require('./job');

const { setStatus } = require('../update/status');
const { createReport } = require('../update/report');

const { downloadChangefile } = require('../update/download');
const { noChangefileMail } = require('../mail');

const {
  getState,
  end,
  fail,
  createState,
  addStepGetChangefiles,
  updateLatestStep,
  getLatestStep,
} = require('../update/state');

const { deleteFile } = require('../files');
const { getChangefiles } = require('../unpaywall/api');
const { updateReportMail } = require('../mail');

async function endJobAsError() {
  await fail();
  const state = getState();
  await createReport(state);
  updateReportMail(state);
  setStatus(false);
}

async function endJobAsSuccess() {
  await end();
  const state = getState();
  await createReport(state);
  setStatus(false);
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
    await endJobAsError(err);
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
      await endJobAsError(err);
      appLogger.error('[job][changefiles][history][download][insert]: History download and insert changefile job is finish with an error', err);
      return;
    }

    jobConfig.filename = changefilesInfo[i].filename;

    try {
      await insertHistoryDataUnpaywall(jobConfig);
    } catch (err) {
      appLogger.error(`[job][changefiles][history][download][insert]: Cannot insert changefile [${changefilesInfo[i].filename}]`);
      await endJobAsError(err);
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

module.exports = downloadInsertChangefilesHistoryProcess;
