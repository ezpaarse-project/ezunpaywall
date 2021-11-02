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
  if (process.env.NODE_ENV === 'production') {
    apiKeys = await fs.readFile(path.resolve(__dirname, '..', 'apikey.json'));
  } else {
    apiKeys = await fs.readFile(path.resolve(__dirname, '..', 'apikey-dev.json'));
  }
  apiKeys = JSON.parse(apiKeys);

  const apiKeysJSON = Object.keys(apiKeys);

  apiKeysJSON.forEach(async (key) => {
    try {
      await redisClient.set(key, `${JSON.stringify(apiKeys[key])}`);
    } catch (err) {
      logger.error(`Cannot load ${key} with ${JSON.stringify(apiKeys[key])} on redis`);
      logger.error(err);
    }
  });
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

module.exports = {
  redisClient,
  pingRedis,
  load,
};
