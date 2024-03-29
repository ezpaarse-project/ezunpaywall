const path = require('path');
const redis = require('redis');
const util = require('util');
const config = require('config');
const fs = require('fs-extra');

const logger = require('../logger');

let apiKeys;

const redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
  },
  password: config.get('redis.password'),
});

redisClient.get = util.promisify(redisClient.get);
redisClient.del = util.promisify(redisClient.del);
redisClient.ping = util.promisify(redisClient.ping);
redisClient.set = util.promisify(redisClient.set);
redisClient.keys = util.promisify(redisClient.keys);
redisClient.flushall = util.promisify(redisClient.flushall);

redisClient.on('error', (err) => {
  logger.error('[redis] error on client', err);
});

/**
 * Load the dev apikeys on redis from apikey-dev.json.
 * Using for test.
 *
 * @returns {Promise<void>}
 */
async function load() {
  apiKeys = await fs.readFile(path.resolve(__dirname, '..', '..', 'apikey-dev.json'), 'utf8');
  apiKeys = JSON.parse(apiKeys);

  for (let i = 0; i < apiKeys.length; i += 1) {
    const { apikey } = apiKeys[i];
    const configApikey = apiKeys[i].config;

    try {
      await redisClient.set(apikey, JSON.stringify(configApikey));
      logger.info(`[redis] ${configApikey.name} is loaded`);
    } catch (err) {
      logger.error(`[redis] Cannot load [${apikey}] with config [${JSON.stringify(config)}]`, err);
    }
  }
}

/**
 * Load the dev apikeys on redis from apikey-dev.json.
 * Using for test.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }
  return true;
}

async function startConnectionRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`[redis] Cannot start connection ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }
  logger.info(`[redis] connect success ${config.get('redis.host')}:${config.get('redis.port')}`);
  return true;
}

/**
 * Load the demo apikey on redis which has a limit of 100 000 DOI.
 *
 * @returns {Promise<void>}
 */
async function loadDemoAPIKey() {
  const configAPIKey = {
    name: 'demo',
    access: ['graphql', 'enrich'],
    owner: 'ezunpaywall',
    description: 'test API key for the interface, limited to 100,000 DOIs per day',
    attributes: ['*'],
    allowed: true,
    count: 100000,
  };
  try {
    await redisClient.set('demo', `${JSON.stringify(configAPIKey)}`);
  } catch (err) {
    logger.error('[redis] Cannot create [demo] apikey');
    throw err;
  }
  logger.info('[redis] Demo apikey is loaded');
}

module.exports = {
  redisClient,
  pingRedis,
  startConnectionRedis,
  load,
  loadDemoAPIKey,
};
