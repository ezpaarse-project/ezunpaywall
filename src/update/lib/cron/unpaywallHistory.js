const { unpaywallHistoryCron } = require('config');
const logger = require('../logger');

const Cron = require('../cron');
const { getStatus } = require('../status');

let { active } = unpaywallHistoryCron;

if (active === 'true' || active) active = true;
else active = false;

const updateConfig = {
  index: unpaywallHistoryCron.index,
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
    logger.info(`[cron: ${this.name}] conflit: an update is already in progress`);
    // return;
  }
  // TODO do update
}

const cron = new Cron('updateHistory', unpaywallHistoryCron.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig - Global config.
 */
function update(newConfig) {
  if (newConfig.time) cron.setSchedule(newConfig.time);

  if (newConfig.index) updateConfig.index = newConfig.index;
  if (newConfig.interval) updateConfig.interval = newConfig.interval;

  if (newConfig.index || newConfig.interval) cron.setTask(task);
}

/**
 * Get config of update process and config of cron.
 *
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  const cronConfig = cron.config;
  return { ...cronConfig, ...updateConfig };
}

module.exports = {
  getGlobalConfig,
  update,
  cron,
};
