const chai = require('chai');

const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

const ezunpaywallURL = 'http://localhost:8080';

const isIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`indices.exists in isIndexExist: ${err}`);
  }
  return res.body;
};

const deleteIndex = async (name) => {
  const exist = await isIndexExist(name);
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

const createIndex = async (name, index) => {
  await deleteIndex(name);
  try {
    await client.indices.create({
      index: name,
      body: index,
    });
  } catch (err) {
    logger.error(`indices.delete increateIndex: ${err}`);
  }
};

const countDocuments = async () => {
  const exist = await isIndexExist('unpaywall');
  let data;
  if (exist) {
    try {
      data = await client.count({
        index: 'unpaywall',
      });
    } catch (err) {
      logger.error(`countDocuments: ${err}`);
    }
  }
  return data.body.count ? data.body.count : null;
};

const isInUpdate = async () => {
  let res = true;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/status');
  } catch (err) {
    logger.error(`isInUpdate : ${err}`);
  }
  return res?.body?.inUpdate;
};

const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/state');
  } catch (err) {
    logger.error(`isInUpdate : ${err}`);
  }
  return res?.body?.state;
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  isInUpdate,
  getState,
};
