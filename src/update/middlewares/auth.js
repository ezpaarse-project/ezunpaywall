const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');

/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const apikey = req.get('X-API-KEY');

  if (!apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key} in json format`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!Array.isArray(config?.access) || !config.access.includes('update') || !config.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = {
  checkAuth,
};
