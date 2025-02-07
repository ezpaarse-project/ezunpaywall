const path = require('path');

const Redis = process.env.NODE_ENV === 'test'
  ? require('ioredis-mock')
  : require('ioredis');

const { redis } = require('config');
const fsp = require('fs/promises');

const appLogger = require('./logger/appLogger');

let apiKeys;

let redisClient;

function getClient() {
  return redisClient;
}

function initClient() {
  try {
    redisClient = new Redis({
      host: redis.host,
      port: redis.port,
      password: redis.password,
    });
    appLogger.info('[redis]: client is created');
  } catch (err) {
    appLogger.error(`[redis]: Cannot create redis client - ${err}`);
    throw err;
  }

  redisClient.on('connect', () => {
    appLogger.info('[redis]: redis is connected');
  });

  redisClient.on('ready', () => {
    appLogger.info('[redis]: redis is ready');
  });

  redisClient.on('error', (err) => {
    appLogger.error(`[redis]: redis error [${err}]`);
  });

  redisClient.on('reconnecting', () => {
    appLogger.error('[redis]: reconnecting');
  });
}

/**
 * Load the dev apiKeys on redis from apikey-dev.json.
 * Using for test.
 *
 * @returns {Promise<void>}
 */
async function load() {
  apiKeys = await fsp.readFile(path.resolve(__dirname, '..', '..', 'apikey-dev.json'), 'utf8');
  apiKeys = JSON.parse(apiKeys);

  for (let i = 0; i < apiKeys.length; i += 1) {
    const { apikey } = apiKeys[i];
    const configApikey = apiKeys[i].config;

    try {
      await redisClient.set(apikey, JSON.stringify(configApikey));
      appLogger.info(`[redis]: [${configApikey.name}] is loaded`);
    } catch (err) {
      appLogger.error(`[redis]: Cannot load [${apikey}] with config [${JSON.stringify(configApikey)}]`, err);
    }
  }
}

/**
 * Load the dev apiKeys on redis from apikey-dev.json.
 * Using for test.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    appLogger.error(`[redis]: Cannot ping ${redis.host}:${redis.port}`, err);
    return false;
  }
  return true;
}

async function connectRedis() {
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
  getClient,
  initClient,
  pingRedis,
  connectRedis,
  load,
  loadDemoAPIKey,
};
