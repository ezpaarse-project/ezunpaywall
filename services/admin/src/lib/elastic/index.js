/* eslint-disable global-require */
const { elasticsearch } = require('config');
const getElasticClient = require('./client');

const appLogger = require('../logger/appLogger');

const elasticClient = getElasticClient();

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
    appLogger.error(`[elastic]: Cannot ping ${elasticsearch.nodes}`, err);
    return err.message;
  }
  if (elasticStatus?.statusCode !== 200) {
    appLogger.error(`[elastic]: Cannot ping ${elasticsearch.nodes}. ${elasticStatus?.statusCode}`);
    return false;
  }
  return true;
}

/**
 * Check if index exit.
 *
 * @param {string} index Name of index.
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
 * @param {string} index Name of index.
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
 * @param {string} indexName Name of index.
 * @param {Object} mapping Mapping of index.
 * @param {string} aliasName Name of alias.
 *
 * @returns {Promise<void>}
 */
async function initAlias(indexName, mapping, aliasName) {
  try {
    await createIndex(indexName, mapping);
  } catch (err) {
    appLogger.error(`[elastic]: Cannot create index [${indexName}]`, err);
    return;
  }

  try {
    const { body: aliasExists } = await elasticClient.indices.existsAlias({ name: aliasName });

    if (aliasExists) {
      appLogger.info(`[elastic]: Alias [${aliasName}] already exists`);
    } else {
      appLogger.info(`[elastic]: Creating alias [${aliasName}] pointing to index [${indexName}]`);
      await elasticClient.indices.putAlias({ index: indexName, name: aliasName });
    }
  } catch (err) {
    appLogger.error(`[elastic]: Cannot create alias [${aliasName}] pointing to index [${indexName}]`, err);
  }
}

/**
 * delete index if it exist
 *
 * @param indexName Name of index
 */
async function removeIndex(indexName) {
  const exist = await checkIfIndexExist(indexName);
  if (exist) {
    try {
      await elasticClient.indices.delete({
        index: indexName,
      });
    } catch (err) {
      appLogger.error(`[elastic]: Cannot delete index [${indexName}]`);
      throw err;
    }
    appLogger.info(`[elastic]: Index [${indexName}] is deleted`);
  }
}

async function searchByDOI(dois, index) {
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
    appLogger.error('[elastic]: Cannot search documents with DOI as ID', err);
    return [];
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits.map((hit) => hit._source);
}

/**
 * Search data with range
 *
 * @param {string} date The date on which you want to obtain all the changes
 * @param {string} index Elastic index name
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
    appLogger.error('[elastic]: Cannot request elastic', err);
    return null;
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits;
}

/**
 * Refresh an index.
 *
 * @param {string} index Elastic index name
 * @returns {Promise<void>}
 */
async function refreshIndex(index) {
  return elasticClient.indices.refresh({ index });
}

/**
 * Do a bulk request to elastic.
 *
 * @param {Array<Object>} data List of object to send in bulk.
 * @param {boolean} refresh If true, refresh index after bulk.
 * @returns {Promise<Array<Object>>} list of response of elastic.
 */
async function bulk(data, refresh = false) {
  if (data.length === 0) {
    appLogger.warn('[elastic]: No data is send for bulk');
    return [];
  }

  let elasticResult;
  try {
    elasticResult = await elasticClient.bulk({ body: data, refresh }, { requestTimeout: 1 });
  } catch (err) {
    appLogger.error('[elastic]: Cannot bulk', err);
    throw err;
  }

  return elasticResult;
}

/**
 * Get all unpaywall indices in elastic
 *
 * @returns {Promise<Array<Object>>} A list of indices and their config
 */
async function getIndices() {
  let elasticResult;

  try {
    elasticResult = await elasticClient.cat.indices({ format: 'json', index: 'unpaywall*,-.*' });
  } catch (err) {
    appLogger.error('[elastic]: Cannot get indices', err);
    throw err;
  }

  return elasticResult.body;
}

/**
 * Get all history aliases from elastic
 *
 * @returns {Promise<Array<Object>>} A list of indices and their config
 */
async function getAlias() {
  const regexILM = /^history$/;
  let elasticResult;
  try {
    elasticResult = await elasticClient.cat.aliases({ format: 'json', index: '-.*' });
  } catch (err) {
    appLogger.error('[elastic]: Cannot get aliases', err);
    throw err;
  }
  let alias = elasticResult.body;
  alias = alias.filter((index) => !regexILM.test(index.alias));
  return alias;
}

async function updateDocument(index, id, doc) {
  let elasticResult;
  try {
    elasticResult = await elasticClient.update({
      index,
      id,
      body: {
        doc,
        doc_as_upsert: true,
      },
    });
  } catch (err) {
    appLogger.error(`[elastic]: Cannot update document with id [${id}]`, err);
    throw err;
  }
  return elasticResult;
}

module.exports = {
  elasticClient,
  pingElastic,
  createIndex,
  initAlias,
  searchByDOI,
  refreshIndex,
  bulk,
  searchWithRange,
  getIndices,
  getAlias,
  removeIndex,
  updateDocument,
};
