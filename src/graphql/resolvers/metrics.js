const config = require('config');
const { elasticClient } = require('../service/elastic');
const logger = require('../lib/logger');

const metricsType = require('../models/metrics');

const metrics = {
  type: metricsType,
  resolve: async (parent, args, req) => {
    let index = req?.get('index');

    if (!index) {
      index = config.get('elasticsearch.indexAlias');
    }

    let res;

    try {
      res = await elasticClient.count({
        index,
      });
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
      });
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
  },
};

module.exports = metrics;
