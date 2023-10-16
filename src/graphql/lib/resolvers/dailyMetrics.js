const { getDailyMetrics } = require('../controllers/metrics');

const dailyMetrics = async () => {
  const metrics = getDailyMetrics();
  return metrics;
};

module.exports = dailyMetrics;
