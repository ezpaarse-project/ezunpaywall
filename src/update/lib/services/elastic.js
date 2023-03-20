const fs = require('fs-extra');
const path = require('path');

const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const { nodeEnv } = require('config');
const logger = require('../logger');

const isProd = (nodeEnv === 'production');

let ssl;

if (isProd) {
  let ca;
  const caPath = path.resolve(__dirname, '..', '..', 'certs', 'ca.crt');
  try {
    ca = fs.readFileSync(caPath, 'utf8');
  } catch (err) {
    logger.error(`[elastic] Cannot read elastic certificate file in [${caPath}]`, err);
  }
  ssl = {
    ca,
    rejectUnauthorized: true,
  };
}

const elasticClient = new Client({
  node: {
    url: new URL(`${elasticsearch.host}:${elasticsearch.port}`),
    auth: {
      username: elasticsearch.user,
      password: elasticsearch.password,
    },
    ssl,
  },
  requestTimeout: elasticsearch.timeout,
});

const pingElastic = async () => {
  let elasticStatus;
  try {
    elasticStatus = await elasticClient.ping();
  } catch (err) {
    logger.error(`[elastic] Cannot ping ${elasticsearch.host}:${elasticsearch.port}`, err);
    return err.message;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`[elastic] Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${elasticStatus?.statusCode}`);
    return false;
  }
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
    logger.error(`[elastic] Cannot create index [${indexName}]`, err);
    return;
  }

  try {
    const { body: aliasExists } = await elasticClient.indices.existsAlias({ name: aliasName });

    if (aliasExists) {
      logger.info(`[elastic] Alias [${aliasName}] already exists`);
    } else {
      logger.info(`[elastic] Creating alias [${aliasName}] pointing to index [${indexName}]`);
      await elasticClient.indices.putAlias({ index: indexName, name: aliasName });
    }
  } catch (err) {
    logger.error(`[elastic] Cannot create alias [${aliasName}] pointing to index [${indexName}]`, err);
  }
};

module.exports = {
  elasticClient,
  pingElastic,
  createIndex,
  initAlias,
};
