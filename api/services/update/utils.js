const {
  createState,
  endState,
  getState,
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
  startUpdate();
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
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
  const state = await getState(statename);
  await createReport(statename);
  endUpdate();
};

const weeklyUpdate = async (url) => {
  startUpdate();
  const statename = await createState();
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
