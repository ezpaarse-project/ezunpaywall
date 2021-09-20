/* eslint-disable no-param-reassign */

const {
  createState,
  endState,
  getState,
} = require('./state');

const {
  askUnpaywall,
  downloadFileFromUnpaywall,
  insertDataUnpaywall,
} = require('./steps');

const {
  setInUpdate,
} = require('./status');

const {
  createReport,
} = require('./report');

const {
  sendMailReport,
  sendMailStarted,
} = require('../lib/mail');

/**
 * start an update process of unpaywall data with a file present in ezunpaywall
 * @param {String} filename - name of the file to insert
 * @param {String} index name of the index to which the data will be saved
 * @param {Integer} offset - offset of insertion
 * @param {Integer} limit - limit of insertion
 */
const insertion = async (jobConfig) => {
  setInUpdate(true);
  jobConfig.type = 'file';
  await sendMailStarted(jobConfig);
  const stateName = await createState();
  jobConfig.stateName = stateName;
  const success = await insertDataUnpaywall(jobConfig);
  if (success) {
    await endState(stateName);
  }
  await createReport(stateName);
  setInUpdate(false);
  await sendMailReport(await getState(stateName));
};

/**
 * start an unpaywall data update process by retrieving update files
 * between a period from Unpaywall and inserting its content
 * @param {String} url - url to call for the list of update files
 * @param {String} interval - interval of snapshot update, day or week
 * @param {Date} startDate - start date of the period
 * @param {Date} endDate end date of the period
 * @param {String} index name of the index to which the data will be saved
 */
const insertSnapshotBetweenDates = async (jobConfig) => {
  setInUpdate(true);
  jobConfig.type = 'period';
  await sendMailStarted(jobConfig);
  const stateName = await createState();
  jobConfig.stateName = stateName;
  const snapshotsInfo = await askUnpaywall(jobConfig);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    jobConfig.filename = snapshotsInfo[i].filename;
    jobConfig.offset = -1;
    jobConfig.limit = -1;
    await downloadFileFromUnpaywall(stateName, snapshotsInfo[i]);
    const success = await insertDataUnpaywall(jobConfig);
    if (!success) {
      await endState(stateName);
      await createReport(stateName);
      setInUpdate(false);
      await sendMailReport(await getState(stateName));
      return;
    }
  }
  await endState(stateName);
  await createReport(stateName);
  setInUpdate(false);
  await sendMailReport(await getState(stateName));
};

module.exports = {
  insertion,
  insertSnapshotBetweenDates,
};
