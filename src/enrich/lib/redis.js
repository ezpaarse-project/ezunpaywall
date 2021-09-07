const redis = require('redis');
const util = require('util');
const config = require('config');
const logger = require('./logger');

const redisClient = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.password'),
});

redisClient.get = util.promisify(redisClient.get);
redisClient.ping = util.promisify(redisClient.ping);

const pingRedis = async () => {
  let redisStatus;
  while (redisStatus !== 'PONG') {
    try {
      redisStatus = await redisClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`);
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  logger.info(`ping: ${config.get('redis.host')}:${config.get('redis.port')} ok`);
  return true;
};

module.exports = {
  redisClient,
  pingRedis,
};
