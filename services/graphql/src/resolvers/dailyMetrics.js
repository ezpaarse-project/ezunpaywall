const { getDailyMetrics } = require('../lib/metrics');

const dailyMetrics = async () => {
  const metrics = getDailyMetrics();
  return metrics;
};

module.exports = dailyMetrics;
