/* eslint-disable no-param-reassign */

const logger = require('../logger');
const { setInUpdate } = require('../status');
const { downloadChangefile } = require('../download');

const {
  endState,
  fail,
  createState,
  addStepGetChangefiles,
  updateLatestStep,
  getLatestStep,
} = require('../state');

const { insertHistoryDataUnpaywall } = require('./history');
const { getChangefiles } = require('../services/unpaywall');
const { sendMailNoChangefile } = require('../services/mail');

/**
 * Download and insert on elastic the changefiles from unpaywall between a period with history.
 *
 * @param {Object} jobConfig - Config of job.
 * @param {string} jobConfig.index - Name of the index to which the data will be inserted.
 * @param {string} jobConfig.interval - Interval of changefile, day or week are available.
 * @param {string} jobConfig.startDate - Start date for the changefile period.
 * @param {string} jobConfig.endDate - End date for the changefile period.
 * @param {number} jobConfig.offset - Line of the snapshot at which the data insertion starts.
 * @param {number} jobConfig.limit - Line in the file where the insertion stops.
 *
 * @returns {Promise<void>}
 */
async function insertWithOaHistoryJob(jobConfig) {
  setInUpdate(true);
  const {
    interval, startDate, endDate,
  } = jobConfig;
  await createState('unpaywallHistory');
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
    sendMailNoChangefile(startDate, endDate).catch((err) => {
      logger.errorRequest(err);
    });
    await endState();
    return;
  }

  let success = true;
  for (let i = 0; i < changefilesInfo.length; i += 1) {
    success = await downloadChangefile('unpaywallHistory', changefilesInfo[i], interval);
    if (!success) return;
    jobConfig.filename = changefilesInfo[i].filename;
    jobConfig.date = changefilesInfo[i].date;
    success = await insertHistoryDataUnpaywall(jobConfig);
    if (!success) return;
  }
  await endState();
}

module.exports = {
  insertWithOaHistoryJob,
};