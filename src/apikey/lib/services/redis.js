const path = require('path');
const redis = require('redis');
const util = require('util');
const config = require('config');
const fs = require('fs-extra');

const logger = require('../logger');

let apiKeys;

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
  logger.error('[redis] error on client', err);
});

async function load() {
  const filename = 'apikey-dev.json';
  apiKeys = await fs.readFile(path.resolve(__dirname, '..', '..', filename), 'utf8');
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

async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return err?.message;
  }
  return true;
}

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
    return Promise.reject(err);
  }
  logger.info('[redis] Demo apikey is loaded');
}

module.exports = {
  redisClient,
  pingRedis,
  load,
  loadDemoAPIKey,
};
