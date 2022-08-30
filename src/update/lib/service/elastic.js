const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const logger = require('../logger');

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
  for (let i = 1; i <= 4; i += 1) {
    try {
      elasticStatus = await elasticClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    }
    if (elasticStatus?.statusCode !== 200) {
      logger.error(`ping - wait ${2 * i} seconds`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * i));
    } else {
      logger.info(`ping - ${elasticsearch.host}:${elasticsearch.port} ok`);
      return true;
    }
  }
  logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} Fail 4 times`);
  return false;
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
