const { format } = require('date-fns');

const { createCron } = require('../lib/cron');
const logger = require('../lib/logger');
const { insertChangefilesOnPeriod } = require('./job');

const cronConfig = {
  time: '0 0 0 * * *',
  status: false,
  index: 'unpaywall',
  interval: 'day',
};

function updateCron() {
  let startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  if (cronConfig.interval === 'week') startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  insertChangefilesOnPeriod({
    index: cronConfig.index,
    interval: cronConfig.interval,
    startDate,
    endDate,
    offset: 0,
    litmit: -1,
  });
}

let cronProcess = createCron(cronConfig.time, () => updateCron());

function start() {
  try {
    cronProcess.start();
    logger.info('[cron update] - started');
    logger.info(`[cron update] config - time: [${cronConfig.time}] index: [${cronConfig.index}] interval: [${cronConfig.interval}]`);
  } catch (err) {
    logger.error('[cron update]: error in start');
    logger.error(err);
    return;
  }
  cronConfig.status = true;
}

function stop() {
  try {
    cronProcess.stop();
    logger.info('[cron update] - stoped');
  } catch (err) {
    logger.error('[cron update] - error in stop');
    logger.error(err);
    return;
  }
  cronConfig.status = false;
}

function update(config) {
  if (config.time) cronConfig.time = config.time;
  if (config.index) cronConfig.index = config.index;
  if (config.interval) cronConfig.interval = config.interval;

  cronProcess = createCron(cronConfig.time, () => updateCron());
}

module.exports = {
  cronConfig,
  start,
  stop,
  update,
};
