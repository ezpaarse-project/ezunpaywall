const fs = require('fs-extra');
const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const client = require('./client');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL || 'http://localhost:3000';
const snapshotsDir = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots')

/**
 * get report of update
 * @returns {JSON} report
 */
const getReport = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/report');
  } catch (err) {
    console.error(`getReport: ${err}`);
  }
  return res?.body?.report;
};

/**
 * check if index exit
 * @param {string} name Name of index
 * @returns {boolean} if exists
 */
const checkIfIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    console.error(`indices.exists in checkIfIndexExist: ${err}`);
  }
  return res.body;
};

/**
 * delete index if it exists
 * @param {string} name Name of index
 */
const deleteIndex = async (name) => {
  const exists = await checkIfIndexExist(name);
  if (exists) {
    try {
      await client.indices.delete({
        index: name,
      });
    } catch (err) {
      console.error(`deleteIndex: ${err}`);
    }
  }
};

/**
 * create index if it doesn't exists
 * @param {string} name Name of index
 * @param {JSON} index index in JSON format
 */
const createIndex = async (name, index) => {
  const exists = await checkIfIndexExist(name);
  if (!exists) {
    try {
      await client.indices.create({
        index: name,
        body: index,
      });
    } catch (err) {
      console.error(`indices.create in createIndex: ${err}`);
    }
  }
};

/**
 * count how many documents there are in an index
 * @param {string} name Name of index
 * @returns {number} number of document
 */
const countDocuments = async (name) => {
  const exists = await checkIfIndexExist(name);
  let data;
  if (exists) {
    try {
      data = await client.count({
        index: name,
      });
    } catch (err) {
      console.error(`countDocuments: ${err}`);
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
    console.error(`checkIfInUpdate : ${err}`);
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
    console.error(`getState: ${err}`);
  }
  return res?.body?.state;
};

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .delete(`/update/snapshot/${filename}`);
    } catch (err) {
      console.error(`deleteSnapshot: ${err}`);
    }
}

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(ezunpaywallURL)
      .post(`/update/snapshot`)
      .attach('file', path.resolve(snapshotsDir, filename), filename)
  } catch (err) {
    console.error(`addSnapshot: ${err}`);
  }
};

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
