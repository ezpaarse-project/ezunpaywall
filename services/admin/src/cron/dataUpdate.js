const { format, subDays } = require('date-fns');
const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { getStatus } = require('../lib/update/status');

const { downloadInsertChangefilesProcess } = require('../lib/update');

const { ...cronConfig } = cron.dataUpdate;
let { active } = cronConfig;

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
    appLogger.info('[cron][Data update]: conflict: an update is already in progress');
    return;
  }
  const week = (cronConfig.interval === 'week');
  const startDate = format(subDays(new Date(), week ? 7 : 0), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');
  await downloadInsertChangefilesProcess({
    type: 'changefile',
    index: cronConfig.index,
    interval: cronConfig.interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
  });
}

const unpaywallCron = new Cron('Data update', cronConfig.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig Global config.
 */
function update(newConfig) {
  if (newConfig.schedule) {
    cronConfig.schedule = newConfig.schedule;
    unpaywallCron.setSchedule(newConfig.schedule);
  }
  if (newConfig.index) cronConfig.index = newConfig.index;
  if (newConfig.interval) cronConfig.interval = newConfig.interval;
  if (newConfig.index || newConfig.interval) {
    unpaywallCron.setTask(task);
  }
}

/**
 * Get config of update process and config of cron.
 *
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  const order = ['name', 'schedule', 'interval', 'index', 'active'];

  const data = { ...cronConfig, ...unpaywallCron.config };

  const result = {};
  order.forEach((key) => {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  });
  return result;
}

module.exports = {
  getGlobalConfig,
  update,
  cron: unpaywallCron,
};
