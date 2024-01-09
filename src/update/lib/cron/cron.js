const { format, subDays } = require('date-fns');

const Cron = require('../cron');

const { insertChangefilesOnPeriod } = require('../job');

const updateConfig = {
  index: 'unpaywall',
  interval: 'day',
};

/**
 * Starts an update daily process if no update process is started.
 *
 * @returns {Promise<void>}
 */
async function task() {
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

const cron = new Cron('update', '0 0 0 * * *', task);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} config - Global config.
 */
function update(config) {
  if (config.time) updateConfig.time = config.time;
  if (config.index) updateConfig.index = config.index;
  if (config.interval) updateConfig.interval = config.interval;

  cron.setTask(task);
}

/**
 * Get config of update process and config of cron.
 * @returns {Object} Config of update process and config of cron.
 */
function getGlobalConfig() {
  const { config } = cron;
  return { ...config, ...updateConfig };
}

module.exports = {
  getGlobalConfig,
  update,
  cron,
};
