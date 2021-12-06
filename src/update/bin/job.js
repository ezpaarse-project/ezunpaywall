/* eslint-disable no-param-reassign */
const {
  endState,
} = require('./state');

const {
  setInUpdate,
} = require('./status');

const {
  downloadBigSnapshot,
  downloadChangefile,
} = require('./download');

const insertDataUnpaywall = require('./insert');

const {
  getChangefiles,
} = require('./unpaywall');

const downloadAndInsertSnapshot = async (jobConfig) => {
  setInUpdate(true);
  const filename = await downloadBigSnapshot(jobConfig.stateName);
  jobConfig.filename = filename;
  await insertDataUnpaywall(jobConfig);
  await endState(jobConfig.stateName);
};

const insertChangefilesOnPeriod = async (jobConfig) => {
  let success = true;
  setInUpdate(true);
  const {
    stateName, interval, startDate, endDate,
  } = jobConfig;
  const snapshotsInfo = await getChangefiles(stateName, interval, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    success = await downloadChangefile(jobConfig.stateName, snapshotsInfo[i]);
    if (!success) return;
    jobConfig.filename = snapshotsInfo[i].filename;
    success = await insertDataUnpaywall(jobConfig);
    if (!success) return;
  }
  await endState(jobConfig.stateName);
};

const insertChangefile = async (jobConfig) => {
  const config = jobConfig;
  setInUpdate(true);

  await insertDataUnpaywall(jobConfig);
  await endState(config.stateName);
};

module.exports = {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
};
