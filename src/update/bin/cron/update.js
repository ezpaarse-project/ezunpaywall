const { format, subDays } = require('date-fns');
const { cron } = require('config');

const Cron = require('../../lib/cron');
const { getStatus } = require('../status');

const { insertChangefilesOnPeriod } = require('../job');
const logger = require('../../lib/logger');

const updateConfig = {
  index: cron.index,
  interval: cron.interval,
};

async function task() {
  const status = getStatus();
  if (status) {
    logger.info(`[cron ${this.name}] conflit: an update is already in progress`);
    return;
  }
  const week = (updateConfig.interval === 'week');
  const startDate = format(subDays(new Date(), week ? 7 : 0), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  await insertChangefilesOnPeriod({
    index: updateConfig.index,
    interval: updateConfig.interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
  });
}

const updateCron = new Cron('update', cron.schedule, task, cron.active);

function update(config) {
  if (config.time) updateCron.setSchedule(config.time);

  if (config.index) updateConfig.index = config.index;
  if (config.interval) updateConfig.interval = config.interval;

  if (config.index || config.interval) updateCron.setTask(task);
}

function getGlobalConfig() {
  const config = updateCron.getConfig();
  return { ...config, ...updateConfig };
}

module.exports = {
  getGlobalConfig,
  update,
  updateCron,
};
