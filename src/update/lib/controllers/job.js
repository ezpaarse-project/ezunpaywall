/* eslint-disable no-param-reassign */
const {
  endState, fail,
} = require('../models/state');

const {
  setInUpdate,
} = require('./status');

const {
  downloadBigSnapshot,
  downloadChangefile,
} = require('./download');

const {
  createState,
  addStepGetChangefiles,
  updateLatestStep,
  getLatestStep,
} = require('../models/state');

const insertDataUnpaywall = require('./insert');

const {
  getChangefiles,
} = require('../services/unpaywall');

/**
 * Download the current snapshot of unpaywall and insert his content.
 *
 * @param {Object} jobConfig - Config of job that content :
 * @param {String} index - Name of the index to which the data will be inserted.
 * @param {Integer} offset - Line of the snapshot at which the data insertion starts.
 * @param {Integer} limit - Line in the file where the insertion stops.
 */
const downloadAndInsertSnapshot = async (jobConfig) => {
  setInUpdate(true);
  await createState();
  const filename = await downloadBigSnapshot(jobConfig);
  if (!filename) {
    await fail();
    return;
  }
  jobConfig.filename = filename;
  await insertDataUnpaywall(jobConfig);
  await endState();
};

/**
 * Download and insert on elastic the changefiles from unpaywall between a period.
 *
 * @param {Object} jobConfig - Config of job that content :
 * @param {String} index - Name of the index to which the data will be inserted.
 * @param {String} interval - Interval of changefile, day or week are available.
 * @param {String} startDate - Start date for the changefile period.
 * @param {String} endDate - End date for the changefile period.
 * @param {Integer} offset - Line of the snapshot at which the data insertion starts.
 * @param {Integer} limit - Line in the file where the insertion stops.
 */
const insertChangefilesOnPeriod = async (jobConfig) => {
  setInUpdate(true);
  const {
    interval, startDate, endDate,
  } = jobConfig;
  await createState();
  const start = new Date();
  addStepGetChangefiles();
  const step = getLatestStep();
  const snapshotsInfo = await getChangefiles(interval, startDate, endDate);

  if (!snapshotsInfo) {
    step.status = 'error';
    updateLatestStep(step);
    await fail();
    return;
  }

  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  updateLatestStep(step);
  let success = true;
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    success = await downloadChangefile(snapshotsInfo[i], interval);
    if (!success) return;
    jobConfig.filename = snapshotsInfo[i].filename;
    success = await insertDataUnpaywall(jobConfig);
    if (!success) return;
  }
  await endState();
};

/**
 * Insert on elastic the content of file installed on ezunpaywall.
 *
 * @param {Object} jobConfig - Config of job that content :
 * @param {String} index - Name of the index to which the data will be inserted.
 * @param {Integer} offset - Line of the snapshot at which the data insertion starts.
 * @param {Integer} limit - Line in the file where the insertion stops.
 */
const insertChangefile = async (jobConfig) => {
  setInUpdate(true);
  await createState();
  const success = await insertDataUnpaywall(jobConfig);
  if (success) {
    await endState();
  }
};

module.exports = {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
};
