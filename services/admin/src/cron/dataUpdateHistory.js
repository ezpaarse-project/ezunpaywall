const { format, subDays } = require('date-fns');
const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { getStatus } = require('../lib/update/status');

const { insertWithOaHistoryProcess } = require('../lib/update');

const { ...cronConfig } = cron.dataUpdateHistory;
let { active } = cron.dataUpdateHistory;

if (active === 'true' || active) active = true;
else active = false;

/**
 * Starts an update daily process if no update process is started.
 *
 * @returns {Promise<void>}
 */
async function task() {
  const status = getStatus();
  if (status) {
    appLogger.info(`[cron][${this.name}]: conflict: an update is already in progress`);
    return;
  }
  const isWeek = (cronConfig.interval === 'week');
  const startDate = format(subDays(new Date(), isWeek ? 7 : 0), 'yyyy-MM-dd');
  await insertWithOaHistoryProcess({
    indexBase: cronConfig.indexBase,
    indexHistory: cronConfig.indexHistory,
    interval: cronConfig.interval,
    startDate,
  });
}

const dataUpdateHistoryCron = new Cron('Data update history', cronConfig.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig Global config.
 */
function update(newConfig) {
  if (newConfig.schedule) {
    cronConfig.schedule = newConfig.schedule;
    dataUpdateHistoryCron.setSchedule(newConfig.schedule);
  }
  if (newConfig.indexBase) cronConfig.indexBase = newConfig.indexBase;
  if (newConfig.indexHistory) cronConfig.indexHistory = newConfig.indexHistory;
  if (newConfig.interval) cronConfig.interval = newConfig.interval;
  if (newConfig.index || newConfig.interval) dataUpdateHistoryCron.setTask(task);
}

/**
 * Get config of update process and config of cron.
 *
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  return { ...cronConfig, ...dataUpdateHistoryCron.config };
}

module.exports = {
  getGlobalConfig,
  update,
  cron: dataUpdateHistoryCron,
};
