const { redisClient } = require('../lib/service/redis');
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
  let apikey = req.get('x-api-key');

  if (req.query.apikey && !apikey) {
    apikey = req.query.apikey;
    req.headers['x-api-key'] = req.query.apikey;
  }

  if (!apikey) return next();

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next();
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return next();
  }

  if (!Array.isArray(config?.access) || !config?.access?.includes('graphql') || !config?.allowed) {
    return next();
  }

  req.user = config.name;

  req.attributes = config.attributes;
  return next();
};

module.exports = checkAuth;
