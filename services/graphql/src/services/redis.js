const { createClient } = require('redis');
const util = require('util');
const { redis } = require('config');
const logger = require('../logger/appLogger');

const redisClient = createClient({
  legacyMode: true,
  socket: {
    host: redis.host,
    port: redis.port,
  },
  password: redis.password,
});

redisClient.get = util.promisify(redisClient.get);
redisClient.ping = util.promisify(redisClient.ping);

/**
 * Ping redis service.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingRedis() {
  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${redis.host}:${redis.port}`, err);
    return false;
  }
  return true;
}

async function startConnectionRedis() {
  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`[redis] Cannot start connection ${redis.host}:${redis.port}`, err);
    return false;
  }
  logger.info(`[redis] connect success ${redis.host}:${redis.port}`);
  return true;
}

module.exports = {
  redisClient,
  pingRedis,
  startConnectionRedis,
};
