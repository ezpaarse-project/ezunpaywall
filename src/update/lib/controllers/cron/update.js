const { format, subDays } = require('date-fns');
const { cron } = require('config');

const Cron = require('../../cron');
const { getStatus } = require('../status');

const { insertChangefilesOnPeriod } = require('../job');
const logger = require('../../logger');

let { active } = cron;

if (active === 'true') active = true;
else active = false;

const updateConfig = {
  index: cron.index,
  interval: cron.interval,
};

/**
 * Starts an update daily process if no update process is started.
 */
async function task() {
  const status = getStatus();
  if (status) {
    logger.info(`[cron: ${this.name}] conflit: an update is already in progress`);
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

const updateCron = new Cron('update', '0 0 0 * * *', task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} config - Global config.
 */
function update(config) {
  if (config.time) updateCron.setSchedule(config.time);

  if (config.index) updateConfig.index = config.index;
  if (config.interval) updateConfig.interval = config.interval;

  if (config.index || config.interval) updateCron.setTask(task);
}

/**
 * Get config of update process and config of cron.
 *
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  const config = updateCron.getConfig();
  return { ...config, ...updateConfig };
}

module.exports = {
  getGlobalConfig,
  update,
  updateCron,
};
