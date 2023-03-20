const logger = require('../logger');

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

async function setMetrics() {
  metrics = await getMetrics();
  logger.info('[metrics] metrics is updated');
}

function getDailyMetrics() { return metrics; }

module.exports = {
  setMetrics,
  getDailyMetrics,
};
