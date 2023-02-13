const metricsType = require('../models/metrics');

const { getDailyMetrics } = require('../controllers/metrics');

const dailyMetrics = {
  type: metricsType,
  resolve: async () => getDailyMetrics(),
};

module.exports = dailyMetrics;
