const { CronJob } = require('cron');
const { timezone } = require('config');

const appLogger = require('./logger/appLogger');

const { redisClient } = require('./redis');

/**
 * Cron that runs every day to resets the DOI limit to be requested from demo apikey.
 */
const cronDemo = new CronJob('0 0 0 * * *', async () => {
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

  apikeyConfig.count = 100000;

  try {
    await redisClient.set('demo', `${JSON.stringify(apikeyConfig)}`);
  } catch (err) {
    appLogger.error(`[cron][demo]: Cannot update apikey [demo] with config [${JSON.stringify(apikeyConfig)}]`, err);
    return Promise.reject(err);
  }
  appLogger.info('[cron][demo]: Demo apikey has been reset');
}, null, true, timezone);

module.exports = cronDemo;
