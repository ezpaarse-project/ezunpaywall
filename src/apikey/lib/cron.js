const { CronJob } = require('cron');
const logger = require('./logger');

const { redisClient } = require('./services/redis');

/**
 * Cron that runs every day to resets the DOI limit to be requested from demo apikey.
 */
const cronDemo = new CronJob('0 0 0 * * *', async () => {
  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get('demo');
  } catch (err) {
    logger.error('[cron][demo]: Cannot get [demo]', err);
    return;
  }

  try {
    apikeyConfig = JSON.parse(apikeyConfig);
  } catch (err) {
    logger.error(`[cron][demo]: Cannot parse [${apikeyConfig}]`, err);
    return;
  }

  apikeyConfig.count = 100000;

  try {
    await redisClient.set('demo', `${JSON.stringify(apikeyConfig)}`);
  } catch (err) {
    logger.error(`[cron][demo]: Cannot update apikey [demo] with config [${JSON.stringify(apikeyConfig)}]`, err);
    return Promise.reject(err);
  }
  logger.info('[cron][demo]: Demo apikey has been reset');
}, null, true, 'Europe/Paris');

module.exports = cronDemo;
