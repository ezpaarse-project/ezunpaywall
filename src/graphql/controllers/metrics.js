const logger = require('../lib/logger');

const { getMetrics } = require('../lib/service/elastic');

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
  logger.info('daily metrics updated');
}

function getDailyMetrics() { return metrics; }

module.exports = {
  setMetrics,
  getDailyMetrics,
};
