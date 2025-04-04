const { cron } = require('config');

const Cron = require('./cron');

const appLogger = require('../lib/logger/appLogger');

const { getClient } = require('../lib/redis/client');

const { ...cronConfig } = cron.demoApikey;

let { active } = cronConfig;
if (active === 'true' || active) active = true;
else active = false;

async function task() {
  appLogger.info('[cron][demo]: Has started');
  const redisClient = getClient();
  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get('demo');
  } catch (err) {
    appLogger.error('[cron][demo]: Cannot get [demo]', err);
    return;
  }

  try {
    apikeyConfig = JSON.parse(apikeyConfig);
  } catch (err) {
    appLogger.error(`[cron][demo]: Cannot parse [${apikeyConfig}]`, err);
    return;
  }

  apikeyConfig.count = cronConfig.count;

  try {
    await redisClient.set('demo', `${JSON.stringify(apikeyConfig)}`);
  } catch (err) {
    appLogger.error(`[cron][demo]: Cannot update apikey [demo] with config [${JSON.stringify(apikeyConfig)}]`, err);
    return Promise.reject(err);
  }
  appLogger.info('[cron][demo]: Has finished: Demo apikey has been reset');
}

/**
 * Cron that runs every day to resets the DOI limit to be requested from demo apikey.
 */
const apikeyDemoCron = new Cron('Apikey demo', cronConfig.schedule, task, active);

/**
 * Update config of update process and config of cron.
 *
 * @param {Object} newConfig Global config.
 */
function update(newConfig) {
  if (newConfig.schedule) {
    cronConfig.schedule = newConfig.schedule;
    apikeyDemoCron.setSchedule(newConfig.schedule);
  }
  if (newConfig.count) cronConfig.count = newConfig.count;
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
    'count',
    'active',
  ];
  const data = { ...cronConfig, ...apikeyDemoCron.config };

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
  cron: apikeyDemoCron,
};
