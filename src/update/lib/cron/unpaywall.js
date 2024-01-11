const { format, subDays } = require('date-fns');
const { unpaywallCron } = require('config');
const logger = require('../logger');

const Cron = require('../cron');
const { getStatus } = require('../status');

const { insertChangefilesOnPeriod } = require('../job');

let { active } = unpaywallCron;

if (active === 'true' || active) active = true;
else active = false;

const cronConfig = {
  index: unpaywallCron.index,
  interval: unpaywallCron.interval,
};

/**
 * Starts an update daily process if no update process is started.
 *
 * @returns {Promise<void>}
 */
async function task() {
  const status = getStatus();
  if (status) {
    logger.info(`[cron: ${this.name}] conflict: an update is already in progress`);
    return;
  }
  const week = (cronConfig.interval === 'week');
  const startDate = format(subDays(new Date(), week ? 7 : 0), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  await insertChangefilesOnPeriod({
    index: cronConfig.index,
    interval: cronConfig.interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
  });
}

const cron = new Cron('update', unpaywallCron.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig - Global config.
 */
function update(newConfig) {
  if (newConfig.time) cron.setSchedule(newConfig.time);

  if (newConfig.index) cronConfig.index = newConfig.index;
  if (newConfig.interval) cronConfig.interval = newConfig.interval;

  if (newConfig.index || newConfig.interval) cron.setTask(task);
}

/**
 * Get config of update process and config of cron.
 *
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  const { config } = cron;
  return { ...cronConfig, ...config };
}

module.exports = {
  getGlobalConfig,
  update,
  cron,
};
