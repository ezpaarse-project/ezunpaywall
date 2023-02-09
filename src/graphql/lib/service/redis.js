const redis = require('redis');
const util = require('util');
const config = require('config');
const logger = require('../logger');

const redisClient = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.password'),
});

redisClient.get = util.promisify(redisClient.get);
redisClient.ping = util.promisify(redisClient.ping);

async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`);
    logger.error(err?.message);
    return err?.message;
  }
  return true;
}

module.exports = {
  redisClient,
  pingRedis,
};
