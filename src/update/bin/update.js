/* eslint-disable no-await-in-loop */

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

const { send } = require('../lib/mail');

/**
 * start an update process of unpaywall data with a file present in ezunpaywall
 * @param {string} filename - nom du fichier à insérer
 * @param {string} index name of the index to which the data will be saved
 * @param {object} options - limit and offset of insertion
 */
const insertion = async (filename, index, options) => {
  setInUpdate(true);
  const statename = await createState();
  await insertDataUnpaywall(statename, filename, index, options);
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
  // TODO use micro-service mail
  await send(await getState(statename));
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
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    await downloadFileFromUnpaywall(statename, snapshotsInfo[i]);
    const opts = { offset: -1, limit: -1 };
    await insertDataUnpaywall(statename, snapshotsInfo[i].filename, index, opts);
  }
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
  // TODO use micro-service mail
  await send(await getState(statename));
};

module.exports = {
  insertion,
  insertSnapshotBetweenDates,
};
