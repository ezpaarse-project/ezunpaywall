const {
  getMetadatas,
  setIteratorFile,
  createStatus,
  createReport,
  endStatus,
  startTask,
  endTask,
  resetTask,
} = require('./status');

const {
  fetchUnpaywall,
  downloadUpdateSnapshot,
  insertDatasUnpaywall,
} = require('./steps');

const insertion = async (name, options) => {
  setIteratorFile(1);
  getMetadatas().push({ filename: name });
  startTask();
  await createStatus();
  await insertDatasUnpaywall(options);
  endTask();
  await endStatus();
  await createReport('success');
  resetTask();
  return true;
};

const insertSnapshotBetweenDate = async (url, startDate, endDate) => {
  // initialize informations on task
  startTask();
  await createStatus();

  const fetch = await fetchUnpaywall(url, startDate, endDate);
  if (!fetch) {
    return null;
  }
  for (let i = 0; i < getMetadatas().length; i += 1) {
    setIteratorFile(1);
    // eslint-disable-next-line no-await-in-loop
    const snapshot = await downloadUpdateSnapshot();
    if (!snapshot) {
      return null;
    }
    // eslint-disable-next-line no-await-in-loop
    const insert = await insertDatasUnpaywall({ offset: -1, limit: -1 });
    if (!insert) {
      return null;
    }
  }
  endTask();
  await endStatus();
  await createReport('success');
  resetTask();
  return true;
};

const weeklyUpdate = async (url) => {
  const endDate = Date.now();
  // current date - one week
  const startDate = endDate - (7 * 24 * 60 * 60 * 1000);
  await insertSnapshotBetweenDate(url, startDate, endDate);
};

module.exports = {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
