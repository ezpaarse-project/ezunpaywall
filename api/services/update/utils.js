/* eslint-disable no-await-in-loop */
const {
  createState,
  endState,
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

/**
 * start an update process of unpaywall data with a file present in ezunpaywall
 * @param {string} filename - nom du fichier à insérer
 * @param {object} options - limit and offset of insertion
 */
const insertion = async (filename, options) => {
  setInUpdate(true);
  const statename = await createState();
  await insertDataUnpaywall(statename, options, filename);
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
};

/**
 * start an unpaywall data update process by retrieving update files
 * between a period from Unpaywall and inserting its content
 * @param {string} url - url to call for the list of update files
 * @param {date} startDate - start date of the period
 * @param {date} endDate end date of the period
 */
const insertSnapshotBetweenDates = async (url, startDate, endDate) => {
  setInUpdate(true);
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    await downloadFileFromUnpaywall(statename, snapshotsInfo[i]);
    const opts = { offset: -1, limit: -1 };
    await insertDataUnpaywall(statename, opts, snapshotsInfo[i].filename);
  }
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
};

module.exports = {
  insertion,
  insertSnapshotBetweenDates,
};
