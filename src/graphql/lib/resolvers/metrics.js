const { getMetrics } = require('../services/elastic');

const metricsType = require('../models/metrics');

const metrics = {
  type: metricsType,
  resolve: async (parent, args, req) => {
    const index = req?.get('index');
    const res = await getMetrics(index);
    return res;
  },
};

module.exports = metrics;
