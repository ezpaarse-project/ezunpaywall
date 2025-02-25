const { elasticsearch } = require('config');
const logger = require('../logger/appLogger');

const getElasticClient = require('./client');

const elasticClient = getElasticClient();

/**
 * Ping elastic service.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingElastic() {
  let elasticStatus;
  try {
    elasticStatus = await elasticClient.ping();
  } catch (err) {
    logger.error(`[elastic]: Cannot ping ${elasticsearch.nodes}`, err);
    return false;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`[elastic]: Cannot ping ${elasticsearch.nodes} - ${elasticStatus?.statusCode}`);
    return false;
  }
  return true;
}

/**
 * Get metrics of unpaywall data in elastic.
 * count of doi
 * count of is_oa
 * count of oa_status: 'gold'
 * count of oa_status: 'hybrid'
 * count of oa_status: 'bronze'
 * count of oa_status: 'green'
 * count of oa_status: 'closed'
 *
 * @param {string} indexName Index name
 *
 * @returns {Promise<Object>} metrics
 */
async function getMetrics(indexName) {
  let res;

  try {
    res = await elasticClient.count({
      index: indexName,
    }, { requestTimeout: '600s' });
  } catch (err) {
    logger.error(`[elastic]: Cannot count on index [${indexName}]`, err);
    return null;
  }

  const doi = res.body.count;

  try {
    res = await elasticClient.search({
      index: indexName,
      body: {
        aggs: {
          isOA: {
            filter: {
              term: { is_oa: true },
            },
          },
          goldOA: {
            filter: {
              term: { oa_status: 'gold' },
            },
          },
          hybridOA: {
            filter: {
              term: { oa_status: 'hybrid' },
            },
          },
          bronzeOA: {
            filter: {
              term: { oa_status: 'bronze' },
            },
          },
          greenOA: {
            filter: {
              term: { oa_status: 'green' },
            },
          },
          closedOA: {
            filter: {
              term: { oa_status: 'closed' },
            },
          },
        },
      },
    }, { requestTimeout: '600s' });
  } catch (err) {
    logger.error('[elastic]: Cannot get unpaywall metric', err);
    return null;
  }

  const { aggregations } = res.body;

  const isOA = aggregations.isOA.doc_count;
  const goldOA = aggregations.goldOA.doc_count;
  const hybridOA = aggregations.hybridOA.doc_count;
  const bronzeOA = aggregations.bronzeOA.doc_count;
  const greenOA = aggregations.greenOA.doc_count;
  const closedOA = aggregations.closedOA.doc_count;

  return {
    doi,
    isOA,
    goldOA,
    hybridOA,
    bronzeOA,
    greenOA,
    closedOA,
  };
}

/**
 * Search unpaywall document in elastic
 * @param {string} indexName Index name
 * @param {number} size Size of elements requested
 * @param {Object} body Config of elastic request
 *
 * @returns {Object} Elastic response
 */
async function search(indexName, size, body) {
  let res;
  try {
    res = await elasticClient.search({
      index: indexName,
      size,
      body,
    });
  } catch (err) {
    logger.error(`[elastic]: Cannot request elastic in index [${indexName}]`, err);
    throw err;
  }
  // eslint-disable-next-line no-underscore-dangle
  return res.body.hits.hits.map((hit) => hit._source);
}

module.exports = {
  elasticClient,
  pingElastic,
  getMetrics,
  search,
};
