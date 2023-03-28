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
  } catch {
    logger.error(`Cannot read elastic certificate file in ${caPath}`);
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

/**
 * Ping elastic service
 *
 * @returns {Boolean} ping
 */
const pingElastic = async () => {
  let elasticStatus;
  try {
    elasticStatus = await elasticClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    return err.message;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port}`);
    return false;
  }
  return true;
};

/**
 * Check if index exit.
 *
 * @param {String} index Name of index.
 *
 * @returns {boolean} If index exist.
 */
const checkIfIndexExist = async (index) => {
  const { body } = await elasticClient.indices.exists({ index });
  return body;
};

/**
 * Create index if it doesn't exist.
 *
 * @param {String} index Name of index.
 * @param {Object} mapping mapping in JSON format.
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

/**
 * Create alias on elastic.
 *
 * @param {String} indexName - Name of index
 * @param {Object} mapping - Mapping of index
 * @param {String} aliasName - Name of alias
 */
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
