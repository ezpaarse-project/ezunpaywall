const { apiLogger } = require('../../logger/logger');
const {
  getMetadatas,
  createStatus,
  createReport,
  endStatus,
  startTask,
  endTask,
  resetTasks,
} = require('./status');

const {
  fetchUnpaywall,
  downloadUpdateSnapshot,
  insertDatasUnpaywall,
} = require('./steps');

const insertion = async (name) => {
  getMetadatas().push({ filename: name });
  await startTask();
  await createStatus();
  try {
    await insertDatasUnpaywall();
  } catch (err) {
    apiLogger.error(err);
  }
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
};

const weeklyUpdate = async () => {
  // initialize informations on task
  startTask();
  createStatus();
  try {
    // TODO check for a other syntax
    // create a date with format YYYY-mm-dd and possible to use fonction getTime
    const endDate = new Date(new Date().toISOString().split('T')[0]);
    // current date - one week
    const startDate = endDate.getTime() - 604800000;
    await fetchUnpaywall(startDate, endDate);
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await downloadUpdateSnapshot();
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await insertDatasUnpaywall();
  } catch (err) {
    apiLogger.error(err);
  }
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
};

const insertSnapshotBetweenDate = async (startDate, endDate) => {
  // initialize informations on task
  startTask();
  createStatus();
  try {
    await fetchUnpaywall(startDate, endDate);
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await downloadUpdateSnapshot();
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await insertDatasUnpaywall();
  } catch (err) {
    apiLogger.error(err);
  }
  endTask();
  endStatus();
  createReport('success');
  resetTasks();
};

module.exports = {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
