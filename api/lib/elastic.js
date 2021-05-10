/* eslint-disable no-await-in-loop */
const { elasticsearch } = require('config');
const client = require('./client');
const { logger } = require('./logger');
const unpaywallTemplate = require('../index/unpaywall.json');

const pingElastic = async () => {
  let elasticStatus;
  while (elasticStatus?.statusCode !== 200) {
    try {
      elasticStatus = await client.ping();
    } catch (err) {
      logger.error(`elastic ping at ${elasticsearch.host}:${elasticsearch.port} ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  logger.info(`elastic ping: ${elasticsearch.host}:${elasticsearch.port} is ok`);
  return true;
};

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

const createIndex = async (name, index) => {
  const exist = await isIndexExist(name);
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

const initalizeIndex = async () => {
  const up = await pingElastic();
  if (up) {
    await createIndex('unpaywall', unpaywallTemplate);
  }
};

module.exports = {
  initalizeIndex,
};
