const { redis } = require('config');

const { getClient } = require('./client');

const appLogger = require('../logger/appLogger');

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

/**
 * Load the demo apikey on redis which has a limit of 100 000 DOI.
 *
 * @returns {Promise<void>}
 */
async function loadDemoAPIKey() {
  const redisClient = getClient();
  const configAPIKey = {
    name: 'demo',
    access: ['graphql', 'enrich'],
    owner: 'ezunpaywall',
    description: 'API key for demonstrator, limited to 100,000 DOIs per day',
    attributes: ['*'],
    allowed: true,
    count: 100000,
  };
  try {
    await redisClient.set('demo', `${JSON.stringify(configAPIKey)}`);
  } catch (err) {
    appLogger.error('[redis]: Cannot create [demo] apikey');
    throw err;
  }
  appLogger.info('[redis]: Demo apikey is loaded');
}

module.exports = {
  pingRedis,
  connectRedis,
  loadDemoAPIKey,
};
