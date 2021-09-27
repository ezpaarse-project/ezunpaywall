const redis = require('redis');
const util = require('util');
const config = require('config');
const fs = require('fs-extra');

const logger = require('./logger');

let apiKeys;

if (!fs.pathExists('../apikey.json')) {
  logger.warn('No API key are set');
}

if (process.env.NODE_ENV === 'production') {
  apiKeys = require('../apikey.json');
} else {
  apiKeys = require('../apikey-dev.json');
}

const redisClient = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.password'),
});

redisClient.ping = util.promisify(redisClient.ping);

redisClient.on('error', (err) => {
  logger.error(`Error in redis ${err}`);
});

const apiKeysJSON = Object.keys(apiKeys);

const load = () => {
  apiKeysJSON.forEach((key) => {
    redisClient.set(key, `${JSON.stringify(apiKeys[key])}`, redis.print);
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
  logger.info(`ping: ${config.get('redis.host')}:${config.get('redis.port')} ok`);
  return true;
};

redisClient.get = util.promisify(redisClient.get);
redisClient.del = util.promisify(redisClient.del);
redisClient.ping = util.promisify(redisClient.ping);

module.exports = {
  redisClient,
  pingRedis,
  load,
};
