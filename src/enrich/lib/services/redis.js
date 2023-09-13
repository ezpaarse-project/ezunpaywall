const redis = require('redis');
const util = require('util');
const config = require('config');
const logger = require('../logger');

const redisClient = redis.createClient({
  legacyMode: true,
  socket: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
  },
  password: config.get('redis.password'),
});

//
redisClient.get = util.promisify(redisClient.get);
redisClient.ping = util.promisify(redisClient.ping);

/**
 * Ping redis service.
 *
 * @returns {Promise<boolean>} Ping
 */
async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }
  logger.info(`[redis] ping success ${config.get('redis.host')}:${config.get('redis.port')}`);
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

module.exports = {
  redisClient,
  startConnectionRedis,
  pingRedis,
};
