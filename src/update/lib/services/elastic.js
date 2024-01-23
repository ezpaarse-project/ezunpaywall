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

/**
 * Ping elastic service.
 *
 * @returns {Promise<boolean>} ping.
 */
async function pingElastic() {
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
}

/**
 * Check if index exit.
 *
 * @param {string} index - Name of index.
 *
 * @returns {Promise<boolean>} If index exist.
 */
async function checkIfIndexExist(index) {
  const { body } = await elasticClient.indices.exists({ index });
  return body;
}

/**
 * Create index if it doesn't exist.
 *
 * @param {string} index - Name of index.
 * @param {Object} mapping mapping in JSON format.
 *
 * @returns {Promise<void>}
 */
async function createIndex(index, mapping) {
  const exist = await checkIfIndexExist(index);
  if (!exist) {
    await elasticClient.indices.create({
      index,
      body: mapping,
    });
  }
}

/**
 * Create alias on elastic.
 *
 * @param {string} indexName - Name of index.
 * @param {Object} mapping - Mapping of index.
 * @param {string} aliasName - Name of alias.
 *
 * @returns {Promise<void>}
 */
async function initAlias(indexName, mapping, aliasName) {
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
}

async function searchByDoiAsID(dois, index) {
  if (!dois) { return []; }
  // Normalize request
  const normalizeDOI = dois.map((doi) => doi.toLowerCase());

  const filter = [{ terms: { doi: normalizeDOI } }];

  const query = {
    bool: {
      filter,
    },
  };

  let res;
  try {
    res = await elasticClient.search({
      index,
      size: normalizeDOI.length || 1000,
      body: {
        query,
      },

    });
  } catch (err) {
    console.log('searchByDoiAsID');
    logger.error('[elastic] Cannot search documents with DOI as ID', err);
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits.map((hit) => hit._source);
}

/**
 * Search data with range
 * @param {string} date - The date on which you want to obtain all the changes
 * @param {string} index - Elastic index name
 * @returns {Promise<void>}
 */
async function searchWithRange(date, param, rangeParam, index) {
  const query = {
    bool: {
      filter: [
        {
          range: {
            [param]: {
              [rangeParam]: date,
            },
          },
        },
      ],
    },
  };

  let res;
  try {
    res = await elasticClient.search({
      index,
      body: {
        query,
      },
    });
  } catch (err) {
    logger.error('[elastic] Cannot request elastic', err);
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits;
}

async function refreshIndex(index) {
  return elasticClient.indices.refresh({ index });
}

async function bulk(data, refresh = false) {
  if (data.length === 0) {
    // logger.warn('[elastic]: No data is send for bulk');
    return [];
  }
  return elasticClient.bulk({ body: data, refresh });
}

async function getIndices() {
  const res = await elasticClient.cat.indices({ format: 'json' });
  let indices = res.body;
  indices = indices.filter((index) => index.index.charAt(0) !== '.');
  return indices;
}

async function getAlias() {
  const regexILM = /^ilm-history-[0-9]$/;
  const res = await elasticClient.cat.aliases({ format: 'json' });
  let alias = res.body;
  alias = alias.filter((index) => index.index.charAt(0) !== '.').filter((index) => !regexILM.test(index.alias));
  return alias;
}

module.exports = {
  elasticClient,
  pingElastic,
  createIndex,
  initAlias,
  searchByDoiAsID,
  refreshIndex,
  bulk,
  searchWithRange,
  getIndices,
  getAlias,
};
