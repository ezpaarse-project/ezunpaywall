const { format } = require('date-fns');

const Cron = require('../../lib/cron');
const { getStatus } = require('../status');

const { insertChangefilesOnPeriod } = require('../job');
const logger = require('../../lib/logger');

const updateConfig = {
  index: 'unpaywall',
  interval: 'day',
};

function task() {
  const status = getStatus();
  if (status) {
    logger.info(`[cron ${this.name}] conflit: an update is already in progress`);
    return;
  }
  let startDate = format(new Date(), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  if (updateConfig.interval === 'week') startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
  insertChangefilesOnPeriod({
    index: updateConfig.index,
    interval: updateConfig.interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
  });
}

const cron = new Cron('update', '0 0 0 * * *', () => task());

function update(config) {
  if (config.time) cron.setTime(config.time);

  if (config.index) updateConfig.index = config.index;
  if (config.interval) updateConfig.interval = config.interval;

  if (config.index || config.interval) cron.setTask(() => task());
}

function getGlobalConfig() {
  const config = cron.getConfig();
  return { ...config, ...updateConfig };
}

module.exports = {
  getGlobalConfig,
  update,
  cron,
};
