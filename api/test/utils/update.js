const fs = require('fs-extra');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { logger } = require('../../lib/logger');
const client = require('../../lib/client');

const snapshotDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'snapshot');
const snapshotsDir = path.resolve(__dirname, '..', '..', '..', 'fakeUnpaywall', 'snapshots');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

/**
 * get report of update
 * @returns {JSON} report
 */
const getReport = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/report');
  } catch (err) {
    logger.error(`getReport: ${err}`);
  }
  return res?.body?.report;
};

/**
 * check if index exit
 * @param {string} name Name of index
 * @returns {boolean} if exist
 */
const checkIfIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`indices.exists in checkIfIndexExist: ${err}`);
  }
  return res.body;
};

/**
 * delete index if it exist
 * @param {string} name Name of index
 */
const deleteIndex = async (name) => {
  const exist = await checkIfIndexExist(name);
  if (exist) {
    try {
      await client.indices.delete({
        index: name,
      });
    } catch (err) {
      logger.error(`deleteIndex: ${err}`);
    }
  }
};

/**
 * create index if it doesn't exist
 * @param {string} name Name of index
 * @param {JSON} index index in JSON format
 */
const createIndex = async (name, index) => {
  const exist = await checkIfIndexExist(name);
  if (!exist) {
    try {
      await client.indices.create({
        index: name,
        body: index,
      });
    } catch (err) {
      logger.error(`indices.create in createIndex: ${err}`);
    }
  }
};

/**
 * count how many documents there are in an index
 * @param {string} name Name of index
 * @returns {number} number of document
 */
const countDocuments = async (name) => {
  const exist = await checkIfIndexExist(name);
  let data;
  if (exist) {
    try {
      data = await client.count({
        index: name,
      });
    } catch (err) {
      logger.error(`countDocuments: ${err}`);
    }
  }
  return data.body.count ? data.body.count : 0;
};

/**
 * checks if an update process is being processed
 * @returns {boolean} if in update
 */
const checkIfInUpdate = async () => {
  let res = true;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/status');
  } catch (err) {
    logger.error(`checkIfInUpdate : ${err}`);
  }
  return res?.body?.inUpdate;
};

/**
 * get state of update
 * @returns {JSON} state
 */
const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/state');
  } catch (err) {
    logger.error(`getState: ${err}`);
  }
  return res?.body?.state;
};

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteSnapshot = async (filename) => {
  const filePath = path.resolve(snapshotDir, filename);
  try {
    await fs.remove(filePath);
    logger.info(`file ${filePath} deleted`);
  } catch (err) {
    logger.error(`deleteSnapshot: ${err}`);
  }
};

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (name) => new Promise((resolve, reject) => {
  const destination = path.resolve(snapshotDir, name);
  const source = path.resolve(snapshotsDir, name);

  const readable = fs.createReadStream(source);
  const writable = fs.createWriteStream(destination);

  // download unpaywall file with stream
  const writeStream = readable.pipe(writable);

  writeStream.on('finish', () => {
    logger.info(`file ${name} is installed`);
    return resolve();
  });

  writeStream.on('error', (err) => {
    logger.error(`addSnapshot: ${err}`);
    return reject(err);
  });
});

/**
 * reset the test environment
 */
const resetAll = async () => {
  await deleteIndex('unpaywall');
  await deleteSnapshot('fake1.jsonl.gz');
  await deleteSnapshot('fake2.jsonl.gz');
  await deleteSnapshot('fake3.jsonl.gz');
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  checkIfInUpdate,
  getState,
  getReport,
  addSnapshot,
  deleteSnapshot,
  resetAll,
};
