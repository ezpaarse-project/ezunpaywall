/* eslint-disable no-param-reassign */
const {
  endState,
} = require('../model/state');

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
} = require('../model/state');

const insertDataUnpaywall = require('./insert');

const {
  getChangefiles,
} = require('../service/unpaywall');

const downloadAndInsertSnapshot = async (jobConfig) => {
  setInUpdate(true);
  await createState();
  const filename = await downloadBigSnapshot(jobConfig);
  jobConfig.filename = filename;
  await insertDataUnpaywall(jobConfig);
  await endState();
};

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
