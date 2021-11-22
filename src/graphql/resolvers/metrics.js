const config = require('config');
const { elasticClient } = require('../lib/elastic');
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
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
              filter: {
                term: { is_oa: true },
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

    const isOA = res.body.count;

    try {
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
              filter: {
                term: { oa_status: 'gold' },
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

    const goldOA = res.body.count;

    try {
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
              filter: {
                term: { oa_status: 'hybrid' },
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

    const hybridOA = res.body.count;

    try {
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
              filter: {
                term: { oa_status: 'bronze' },
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

    const bronzeOA = res.body.count;

    try {
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
              filter: {
                term: { oa_status: 'green' },
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

    const greenOA = res.body.count;

    try {
      res = await elasticClient.count({
        index,
        body: {
          query: {
            bool: {
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

    const closedOA = res.body.count;
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
