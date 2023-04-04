/* eslint-disable no-param-reassign */

const logger = require('../logger');

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

const {
  sendMailNoChangefile,
} = require('../services/mail');

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

const insertChangefilesOnPeriod = async (jobConfig) => {
  setInUpdate(true);
  const {
    interval, startDate, endDate,
  } = jobConfig;
  await createState();
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
    success = await downloadChangefile(changefilesInfo[i], interval);
    if (!success) return;
    jobConfig.filename = changefilesInfo[i].filename;
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
