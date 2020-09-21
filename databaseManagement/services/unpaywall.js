const { apiLogger } = require('../../logger/logger');
const {
  tasks,
  metadatas,
  createStatus,
  createReport,
  endStatus,
  resetTasks,
} = require('./status');

const {
  fetchUnpaywall,
  downloadUpdateSnapshot,
  insertDatasUnpaywall,
} = require('./steps');

const endTask = () => {
  tasks.endAt = new Date();
  tasks.took = (tasks.endAt - tasks.createdAt) / 1000;
  tasks.done = true;
  tasks.currentTask = 'end';
};

const startTask = () => {
  tasks.done = false;
  tasks.createdAt = new Date();
};

const insertion = async (name) => {
  metadatas.push({ filename: name });
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
  console.log(tasks);
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
