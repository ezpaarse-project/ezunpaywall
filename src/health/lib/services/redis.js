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
    legacyMode: true,
    socket: {
      host: config.get('redis.host'),
      port: config.get('redis.port'),
    },
    password: config.get('redis.password'),
  });

  try {
    await redisClient.connect();
  } catch (err) {
    logger.error(`[redis] Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }

  try {
    await redisClient.disconnect();
  } catch (err) {
    logger.error(`[redis] Cannot disconnect ${config.get('redis.host')}:${config.get('redis.port')}`, err);
    return false;
  }
  return true;
}

module.exports = pingRedisWithClient;
