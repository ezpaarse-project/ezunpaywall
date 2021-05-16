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
  setInUpdate,
} = require('./status');

const {
  createReport,
} = require('./report');

const insertion = async (name, options) => {
  setInUpdate(true);
  const statename = await createState();
  await insertDataUnpaywall(statename, options, name);
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
};

const insertSnapshotBetweenDate = async (url, startDate, endDate) => {
  setInUpdate(true);
  const statename = await createState();
  const snapshotsInfo = await askUnpaywall(statename, url, startDate, endDate);
  for (let i = 0; i < snapshotsInfo.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await downloadUpdateSnapshot(statename, snapshotsInfo[i]);
    const opts = { offset: -1, limit: -1 };
    // eslint-disable-next-line no-await-in-loop
    await insertDataUnpaywall(statename, opts, snapshotsInfo[i].filename);
  }
  await endState(statename);
  await createReport(statename);
  setInUpdate(false);
};

const weeklyUpdate = async (url) => {
  setInUpdate(true);
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
