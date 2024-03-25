const Cron = require('../../cron');
const logger = require('../../logger');

const { setMetrics } = require('../metrics');

/**
 * Get the metrics from unpaywall and cache them.
 *
 * @returns {Promise<void>}
 */
async function task() {
  await setMetrics();
  logger.info('[cron][metrics]: metrics is updated');
}

const cron = new Cron('metrics', '0 0 0 * * *', task);

module.exports = cron;
