const config = require('config');
const redis = require('redis');
const logger = require('../logger');

/**
 * Ping redis service.
 *
 * @returns @returns {Promise<boolean>}
 */
async function pingRedisWithClient() {
  const redisClient = redis.createClient({
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.password'),
  });

  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }
  return true;
}

module.exports = pingRedisWithClient;
