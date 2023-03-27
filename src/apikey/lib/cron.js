const { CronJob } = require('cron');
const logger = require('./logger');

const { redisClient } = require('./services/redis');

/**
 * Cron that runs every day to resets the DOI limit to be requested from demo apikey.
 */
const cronDemo = new CronJob('0 0 0 * * *', async () => {
  let key;
  try {
    key = await redisClient.get('demo');
  } catch (err) {
    logger.error('Cannot get [demo] on redis');
    logger.error(err);
    return;
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return;
  }

  config.count = 100000;

  try {
    await redisClient.set('demo', `${JSON.stringify(config)}`);
  } catch (err) {
    logger.error('Cannot update apikey [demo] for [count]');
    return Promise.reject(err);
  }
  logger.info('Demo apikey reset');
}, null, true, 'Europe/Paris');

module.exports = cronDemo;
