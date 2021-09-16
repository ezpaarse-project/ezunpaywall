/* eslint-disable no-await-in-loop */
const { format } = require('date-fns');

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
 * @param {string} filename - nom du fichier à insérer
 * @param {string} index name of the index to which the data will be saved
 * @param {number} offset - offset of insertion
 * @param {number} limit - limit of insertion
 */
const insertion = async (filename, index, offset, limit) => {
  setInUpdate(true);
  const config = {
    type: 'file', filename, index, offset, limit,
  };
  await sendMailStarted(config);
  const statename = await createState();
  const success = await insertDataUnpaywall(statename, filename, index, offset, limit);
  if (success) {
    await endState(statename);
  }
  await createReport(statename);
  setInUpdate(false);
  // TODO use micro-service mail
  await sendMailReport(await getState(statename));
};

/**
 * start an unpaywall data update process by retrieving update files
 * between a period from Unpaywall and inserting its content
 * @param {string} url - url to call for the list of update files
 * @param {date} startDate - start date of the period
 * @param {date} endDate end date of the period
 * @param {string} index name of the index to which the data will be saved
 */
const insertSnapshotBetweenDates = async (url, startDate, endDate, index) => {
  setInUpdate(true);
  const config = {
    type: 'period',
    index,
    startDate: format(new Date(startDate), 'dd-MM-yyyy'),
    endDate: format(new Date(endDate), 'dd-MM-yyyy'),
  };
  await sendMailStarted(config);
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    await downloadFileFromUnpaywall(statename, snapshotsInfo[i]);
    const success = await insertDataUnpaywall(statename, snapshotsInfo[i].filename, index, -1, -1);
    if (!success) {
      await endState(statename);
      await createReport(statename);
      setInUpdate(false);
      await sendMailReport(await getState(statename));
      return;
    }
  }
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
  await sendMailReport(await getState(statename));
};

module.exports = {
  insertion,
  insertSnapshotBetweenDates,
};
