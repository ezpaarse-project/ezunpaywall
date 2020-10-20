/* eslint-disable no-unused-vars */
const {
  getMetadatas,
  setIteratorFile,
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

const insertion = async (name, options) => {
  getMetadatas().push({ filename: name });
  await startTask();
  await createStatus();
  const res1 = await insertDatasUnpaywall(options);
  if (!res1) {
    return null;
  }
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
  return true;
};

const weeklyUpdate = async (url) => {
  // initialize informations on task
  startTask();
  createStatus();
  // TODO check for a other syntax
  // create a date with format YYYY-mm-dd and possible to use fonction getTime
  const endDate = new Date(new Date().toISOString().split('T')[0]);
  // current date - one week
  const startDate = endDate.getTime() - 604800000;
  const res1 = await fetchUnpaywall(url, startDate, endDate);
  if (!res1) {
    return null;
  }
  const res2 = await downloadUpdateSnapshot();
  if (!res2) {
    return null;
  }
  const res3 = await insertDatasUnpaywall({ offset: -1, limit: -1 });
  if (!res3) {
    return null;
  }
  await endTask();
  await endStatus();
  await createReport('success');
  await resetTasks();
  return true;
};

const insertSnapshotBetweenDate = async (url, startDate, endDate) => {
  // initialize informations on task
  startTask();
  createStatus();
  const res1 = await fetchUnpaywall(url, startDate, endDate);
  if (!res1) {
    return null;
  }

  // TODO check for a other syntax
  // eslint-disable-next-line no-restricted-syntax
  for await (const metadata of getMetadatas()) {
    const res2 = await downloadUpdateSnapshot();
    if (!res2) {
      return null;
    }
    const res3 = await insertDatasUnpaywall({ offset: -1, limit: -1 });
    if (!res3) {
      return null;
    }
    setIteratorFile(1);
  }
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
