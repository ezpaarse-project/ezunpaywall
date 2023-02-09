const metricsType = require('../models/metrics');

const { getDailyMetrics } = require('../bin/metrics');

const dailyMetrics = {
  type: metricsType,
  resolve: async () => getDailyMetrics(),
};

module.exports = dailyMetrics;
