const path = require('path');
const redis = require('redis');
const util = require('util');
const config = require('config');
const fs = require('fs-extra');

const logger = require('../logger');

let apiKeys;

if (!fs.pathExists('../apikey.json')) {
  logger.warn('No API key are set');
}

const redisClient = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.password'),
});

redisClient.get = util.promisify(redisClient.get);
redisClient.del = util.promisify(redisClient.del);
redisClient.ping = util.promisify(redisClient.ping);
redisClient.set = util.promisify(redisClient.set);
redisClient.keys = util.promisify(redisClient.keys);
redisClient.flushall = util.promisify(redisClient.flushall);

redisClient.on('error', (err) => {
  logger.error(`Error in redis ${err}`);
});

/**
 * Load the dev apikeys on redis from apikey-dev.json.
 * Using for test.
 */
async function load() {
  apiKeys = await fs.readFile(path.resolve(__dirname, '..', '..', 'apikey-dev.json'), 'utf8');
  apiKeys = JSON.parse(apiKeys);

  for (let i = 0; i < apiKeys.length; i += 1) {
    const { apikey } = apiKeys[i];
    const configApikey = apiKeys[i].config;

    try {
      await redisClient.set(apikey, JSON.stringify(configApikey));
      logger.info(`[load] ${configApikey.name} loaded`);
    } catch (err) {
      logger.error(`Cannot load [${apikey}] with config [${JSON.stringify(config)}] on redis`);
      logger.error(err);
    }
  }
}

/**
 * Load the dev apikeys on redis from apikey-dev.json.
 * Using for test.
 */
async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`);
    return err?.message;
  }
  return true;
}

/**
 * Load the demo apikey on redis which has a limit of 100 000 DOI.
 */
async function loadDemoAPIKey() {
  const configAPIKey = {
    name: 'demo',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: true,
    count: 100000,
  };
  try {
    await redisClient.set('demo', `${JSON.stringify(configAPIKey)}`);
  } catch (err) {
    logger.error('Cannot create [demo] apikey');
    return Promise.reject(err);
  }
  logger.info('Demo apikey are loaded');
}

module.exports = {
  redisClient,
  pingRedis,
  load,
  loadDemoAPIKey,
};
