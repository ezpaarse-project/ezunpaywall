const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const logger = require('../lib/logger');

const elasticClient = new Client({
  node: {
    url: new URL(`${elasticsearch.host}:${elasticsearch.port}`),
    auth: {
      username: elasticsearch.user,
      password: elasticsearch.password,
    },
  },
  requestTimeout: 2000,
});

const pingElastic = async () => {
  let elasticStatus;
  do {
    try {
      elasticStatus = await elasticClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port}`);
      logger.error(err);
    }
    if (elasticStatus?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (elasticStatus?.statusCode !== 200);
  logger.info(`ping: ${elasticsearch.host}:${elasticsearch.port} ok`);
  return true;
};

/**
 * check if index exit
 * @param {String} index Name of index
 * @returns {boolean} if exist
 */
const checkIfIndexExist = async (index) => {
  const { body } = await elasticClient.indices.exists({ index });
  return body;
};

/**
 * create index if it doesn't exist
 * @param {String} index Name of index
 * @param {JSON} mapping mapping in JSON format
 */
const createIndex = async (index, mapping) => {
  const exist = await checkIfIndexExist(index);
  if (!exist) {
    await elasticClient.indices.create({
      index,
      body: mapping,
    });
  }
};

const initAlias = async (indexName, mapping, aliasName) => {
  try {
    await createIndex(indexName, mapping);
  } catch (err) {
    logger.error(`Cannot create index [${indexName}]`);
    logger.error(err);
    return;
  }

  try {
    const { body: aliasExists } = await elasticClient.indices.existsAlias({ name: aliasName });

    if (aliasExists) {
      logger.info(`Alias [${aliasName}] already exists`);
    } else {
      logger.info(`Creating alias [${aliasName}] pointing to index [${indexName}]`);
      await elasticClient.indices.putAlias({ index: indexName, name: aliasName });
    }
  } catch (err) {
    logger.error(`Cannot create alias [${aliasName}] pointing to index [${indexName}]`);
    logger.error(err);
  }
};

module.exports = {
  elasticClient,
  pingElastic,
  createIndex,
  initAlias,
};
