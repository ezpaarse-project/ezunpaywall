const Cron = require('../../cron');
const logger = require('../../logger');

const { setMetrics } = require('../metrics');

async function task() {
  await setMetrics();
  logger.info('[dailyMetrics]: metrics updated');
}

const cron = new Cron('dailyMetrics', '0 0 0 * * *', task);

module.exports = cron;
