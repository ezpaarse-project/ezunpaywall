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

const {
  addStepGetChangefiles,
  updateLatestStep,
  getLatestStep,
} = require('./state');

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
  const start = new Date();
  await addStepGetChangefiles(stateName);
  const step = await getLatestStep(stateName);
  const snapshotsInfo = await getChangefiles(interval, startDate, endDate);
  step.took = (new Date() - start) / 1000;
  step.status = 'success';
  await updateLatestStep(stateName, step);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    success = await downloadChangefile(jobConfig.stateName, snapshotsInfo[i], interval);
    if (!success) return;
    jobConfig.filename = snapshotsInfo[i].filename;
    success = await insertDataUnpaywall(jobConfig);
    if (!success) return;
  }
  await endState(jobConfig.stateName);
};

const insertChangefile = async (jobConfig) => {
  setInUpdate(true);
  const success = await insertDataUnpaywall(jobConfig);
  if (success) {
    await endState(jobConfig.stateName);
  }
};

module.exports = {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
};
