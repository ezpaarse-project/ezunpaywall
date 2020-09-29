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
  await insertDatasUnpaywall();
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
  return true;
};

const weeklyUpdate = async () => {
  // initialize informations on task
  startTask();
  createStatus();
  // TODO check for a other syntax
  // create a date with format YYYY-mm-dd and possible to use fonction getTime
  const endDate = new Date(new Date().toISOString().split('T')[0]);
  // current date - one week
  const startDate = endDate.getTime() - 604800000;
  const res1 = await fetchUnpaywall(startDate, endDate);
  if (!res1) {
    return null;
  }
  const res2 = await downloadUpdateSnapshot();
  if (!res2) {
    return null;
  }
  await insertDatasUnpaywall();
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
  return true;
};

const insertSnapshotBetweenDate = async (startDate, endDate) => {
  // initialize informations on task
  startTask();
  createStatus();
  const res1 = await fetchUnpaywall(startDate, endDate);
  if (!res1) {
    return null;
  }
  const res2 = await downloadUpdateSnapshot();
  if (!res2) {
    return null;
  }
  await insertDatasUnpaywall();
  endTask();
  endStatus();
  createReport('success');
  resetTasks();
  return true;
};

module.exports = {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
