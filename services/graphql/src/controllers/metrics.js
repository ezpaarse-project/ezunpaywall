const { elasticsearch } = require('config');
const logger = require('../logger/appLogger');

const { getMetrics } = require('../services/elastic');

let metrics = {
  doi: 0,
  isOA: 0,
  goldOA: 0,
  hybridOA: 0,
  bronzeOA: 0,
  greenOA: 0,
  closedOA: 0,
};

/**
 * Get the metrics from unpaywall and cache them.
 *
 * @returns {Promise<void>}
 */
async function setMetrics() {
  metrics = await getMetrics(elasticsearch.indexBase);
  logger.info('[metrics] metrics is updated');
}

/**
 * Get cached metrics
 */
function getDailyMetrics() {
  return metrics;
}

module.exports = {
  setMetrics,
  getDailyMetrics,
};
