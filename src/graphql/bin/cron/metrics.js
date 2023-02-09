const Cron = require('../../lib/cron');
const logger = require('../../lib/logger');

const { setMetrics } = require('../metrics');

async function task() {
  await setMetrics();
  logger.info('[dailyMetrics]: metrics updated');
}

const cron = new Cron('dailyMetrics', '0 0 0 * * *', task);

module.exports = cron;
