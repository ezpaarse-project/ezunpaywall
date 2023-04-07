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
  requestTimeout: 2000,
});

/**
 * Ping elastic service.
 *
 * @returns {boolean|string} ping
 */
async function pingElastic() {
  let elasticStatus;
  try {
    elasticStatus = await elasticClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    return false;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port}`);
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
 * @param {string} index elastic index to request
 *
 * @returns {Object} metrics
 */
async function getMetrics(index) {
  let res;

  try {
    res = await elasticClient.count({
      index,
    }, { requestTimeout: '600s' });
  } catch (err) {
    logger.error('Cannot request elastic');
    logger.error(err);
    return null;
  }

  const doi = res.body.count;

  try {
    res = await elasticClient.search({
      index,
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
    logger.error('Cannot request elastic');
    logger.error(err);
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

module.exports = {
  elasticClient,
  pingElastic,
  getMetrics,
};
