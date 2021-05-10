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
  startUpdate,
  endUpdate,
} = require('./status');

const {
  createReport,
} = require('./report');

const insertion = async (name, options) => {
  startUpdate();
  const statename = await createState();
  await insertDataUnpaywall(statename, options, name);
  await endState(statename);
  await createReport(statename);
  endUpdate();
};

const insertSnapshotBetweenDate = async (url, startDate, endDate) => {
  setIsUpdate(true);
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(url, statename, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const snapshot = await downloadUpdateSnapshot(statename, snapshotsInfo[i]);
    if (!snapshot) {
      return null;
    }
    const opts = { offset: -1, limit: -1 };
    // eslint-disable-next-line no-await-in-loop
    const insert = await insertDataUnpaywall(statename, opts, snapshotsInfo[i].filename);
    if (!insert) {
      return null;
    }
  }
  await endState(statename);
  await createReport(statename);
  setIsUpdate(false);
};

const weeklyUpdate = async (url) => {
  setIsUpdate(true);
  const statename = await createState();
  const endDate = Date.now();
  // current date - one week
  const startDate = endDate - (7 * 24 * 60 * 60 * 1000);
  await insertSnapshotBetweenDate(url, startDate, endDate);
  await endState(statename);
  await createReport(statename);
  setIsUpdate(false);
};

module.exports = {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
