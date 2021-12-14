const path = require('path');
const redis = require('redis');
const util = require('util');
const config = require('config');
const fs = require('fs-extra');

const logger = require('./logger');

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

const load = async () => {
  const filename = process.env.NODE_ENV === 'production' ? 'apikey.json' : 'apikey-dev.json';
  apiKeys = await fs.readFile(path.resolve(__dirname, '..', filename), 'utf8');
  apiKeys = JSON.parse(apiKeys);

  await Promise.all(
    Object.entries(apiKeys).map(async ([keyId, keyValue]) => {
      try {
        await redisClient.set(keyId, `${JSON.stringify(keyValue)}`);
      } catch (err) {
        logger.error(`Cannot load ${keyId} with ${JSON.stringify(keyValue)} on redis`);
        logger.error(err);
      }
    }),
  );
};

const pingRedis = async () => {
  let redisStatus;
  do {
    try {
      redisStatus = await redisClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`);
      logger.error(err);
    }
    if (redisStatus !== 'PONG') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (redisStatus !== 'PONG');
  logger.info(`ping - ${config.get('redis.host')}:${config.get('redis.port')} ok`);
  return true;
};

const loadDemoAPIKey = async () => {
  const configAPIKey = {
    name: 'demo',
    access: ['graphql', 'enrich'],
    attributes: '*',
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
};

module.exports = {
  redisClient,
  pingRedis,
  load,
  loadDemoAPIKey,
};
