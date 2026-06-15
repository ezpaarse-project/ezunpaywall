const { format, subDays } = require('date-fns');
const { cron } = require('config');
const { setTimeout } = require('timers/promises');

const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');

const { getStatus } = require('../lib/update/status');
const { getState } = require('../lib/update/state');

const { downloadInsertChangefilesProcess } = require('../lib/update');
const { sendDailyUpdateReportMail } = require('../lib/mail');

const { ...cronConfig } = cron.dataUpdate;

let { active } = cronConfig;

if (typeof active === 'string') {
  active = active.toLowerCase() === 'true';
} else {
  active = Boolean(active);
}

/**
 * Starts an update daily process if no update process is started.
 *
 * @returns {Promise<void>}
 */
async function task() {
  appLogger.info('[cron][data-update]: Has started');
  const status = getStatus();
  if (status) {
    appLogger.info('[cron][data-update]: Finished: conflict: an update is already in progress');
    return;
  }

  const week = (cronConfig.interval === 'week');
  const startDate = format(subDays(new Date(), week ? 7 : cronConfig.anteriority), 'yyyy-MM-dd');
  const endDate = format(new Date(), 'yyyy-MM-dd');

  let i = 0;

  let res;

  const jobConfig = {
    type: 'changefile',
    index: cronConfig.index,
    interval: cronConfig.interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
    mail: false,
  };

  while (i < 5) {
    res = await downloadInsertChangefilesProcess(jobConfig);
    i += 1;
    if (res) {
      break;
    }
    await setTimeout(30000);
  }

  const state = getState();
  sendDailyUpdateReportMail(state, i);

  appLogger.info('[cron][data-update]: Has finished');
}

const unpaywallCron = new Cron('data-update', cronConfig.schedule, task, active);

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
  if (newConfig.anteriority) cronConfig.anteriority = newConfig.anteriority;
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
  const order = [
    'name',
    'schedule',
    'interval',
    'anteriority',
    'index',
    'active',
  ];

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
