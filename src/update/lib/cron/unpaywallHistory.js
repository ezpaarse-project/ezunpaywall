const { format, subDays } = require('date-fns');
const { unpaywallHistoryCron } = require('config');
const logger = require('../logger');

const Cron = require('../cron');
const { getStatus } = require('../status');

const { insertWithOaHistoryJob } = require('../job');

let { active } = unpaywallHistoryCron;

if (active === 'true' || active) active = true;
else active = false;

const cronConfig = {
  indexBase: unpaywallHistoryCron.indexBase,
  indexHistory: unpaywallHistoryCron.indexHistory,
  interval: unpaywallHistoryCron.interval,
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
  await insertWithOaHistoryJob({
    index: cronConfig.index,
    interval: cronConfig.interval,
    startDate,
  });
}

const cron = new Cron('updateHistory', unpaywallHistoryCron.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig - Global config.
 */
function update(newConfig) {
  if (newConfig.time) cron.setSchedule(newConfig.time);
  if (newConfig.indexBase) cronConfig.indexBase = newConfig.indexBase;
  if (newConfig.interval) cronConfig.indexHistory = newConfig.indexHistory;
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
