const { redis } = require('config');
const appLogger = require('../logger/appLogger');

const { getClient } = require('./client');

/**
 * Load the dev apiKeys on redis from apikey-dev.json.
 * Using for test.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingRedis() {
  const redisClient = getClient();
  try {
    await redisClient.ping();
  } catch (err) {
    appLogger.error(`[redis]: Cannot ping ${redis.host}:${redis.port}`, err);
    return false;
  }
  return true;
}

async function connectRedis() {
  const redisClient = getClient();
  try {
    await redisClient.connect();
  } catch (err) {
    appLogger.error(`[redis]: Cannot start connection ${redis.host}:${redis.port}`, err);
    return false;
  }
  appLogger.info(`[redis]: Connect success ${redis.host}:${redis.port}`);
  return true;
}

module.exports = {
  connectRedis,
  pingRedis,
};
