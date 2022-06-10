const boom = require('@hapi/boom');
const { redisClient } = require('../service/redis');
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
  const apikey = req.get('x-api-key');

  if (!apikey) {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key} in json format`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  if (!Array.isArray(config?.access) || !config?.access?.includes('update') || !config?.allowed) {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  return next();
};

module.exports = checkAuth;
