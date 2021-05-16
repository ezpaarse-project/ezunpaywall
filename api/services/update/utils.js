/* eslint-disable no-await-in-loop */
const {
  createState,
  endState,
} = require('./state');

const {
  askUnpaywall,
  downloadUpdateSnapshot,
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
 * @param {Stirng} filename - nom du fichier à insérer
 * @param {Object} options - limit and offset of insertion
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
 * @param {Stirng} url - url to call for the list of update files
 * @param {Date} startDate - start date of the period
 * @param {Date} endDate end date of the period
 */
const insertSnapshotBetweenDate = async (url, startDate, endDate) => {
  setInUpdate(true);
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    await downloadUpdateSnapshot(statename, snapshotsInfo[i]);
    const opts = { offset: -1, limit: -1 };
    await insertDataUnpaywall(statename, opts, snapshotsInfo[i].filename);
  }
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
};

module.exports = {
  insertion,
  insertSnapshotBetweenDate,
};
