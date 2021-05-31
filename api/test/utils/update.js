const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const { logger } = require('../../lib/logger');

const client = require('../../lib/client');

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
  const exist = await checkIfIndexExist(name);
  let data;
  if (exist) {
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
    logger.error(`getState : ${err}`);
  }
  return res?.body?.state;
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  checkIfInUpdate,
  getState,
  getReport,
};
