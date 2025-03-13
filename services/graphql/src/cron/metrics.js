const { cron } = require('config');

const Cron = require('./cron');
const logger = require('../lib/logger/appLogger');

const { setMetrics } = require('../lib/metrics');

const cronConfig = cron.metrics;

let { active } = cronConfig;
if (active === 'true' || active) active = true;
else active = false;

/**
 * Get the metrics from unpaywall and cache them.
 *
 * @returns {Promise<void>}
 */
async function task() {
  await setMetrics();
  logger.info('[cron][metrics]: metrics is updated');
}

const metricsCron = new Cron('metrics', '0 0 0 * * *', task);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig Global config.
 */
function update(newConfig) {
  if (newConfig.schedule) {
    cronConfig.schedule = newConfig.schedule;
    metricsCron.setSchedule(newConfig.schedule);
  }
}

function getGlobalConfig() {
  const order = [
    'name',
    'schedule',
    'active',
  ];

  const data = { ...cronConfig, ...metricsCron.config };

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
  cron: metricsCron,
};
