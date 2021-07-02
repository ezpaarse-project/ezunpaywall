/* eslint-disable no-await-in-loop */
const { elasticsearch } = require('config');
const client = require('./client');
const { logger } = require('./logger');
const unpaywallTemplate = require('../index/unpaywall.json');

const pingElastic = async () => {
  let elasticStatus;
  try {
    elasticStatus = await client.ping();
  } catch (err) {
    logger.error(`elastic ping at ${elasticsearch.host}:${elasticsearch.port} ${err}`);
  }
  if (elasticStatus?.statusCode !== 200) {
    setTimeout(pingElastic, 1000);
  } else {
    logger.info(`elastic ping: ${elasticsearch.host}:${elasticsearch.port} is ok`);
  }
};

const checkIfIndexExists = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`indices.exists in checkIfIndexExists: ${err}`);
  }
  return res.body;
};

const createIndex = async (name, index) => {
  const exists = await checkIfIndexExists(name);
  if (exists) {
    return logger.info(`index [${name}] already exists`);
  }
  return client.indices.create({
    index: name,
    body: index,
  });
};

const initalizeIndex = async () => {
  const up = await pingElastic();
  if (!up) {
    return logger.warn('waiting for elasticsearch');
  }
  try {
    await createIndex('unpaywall', unpaywallTemplate);
  } catch (err) {
    logger.error(`indices.create in createIndex: ${err}`);
  }
  return logger.info('index initialized');
};

module.exports = {
  initalizeIndex,
};
