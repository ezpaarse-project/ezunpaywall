const { redisClient } = require('../lib/redis');

const logger = require('../lib/logger/appLogger');

/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches the apikey in redis and the apikey config.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 *
 * This middleware need a header that contains the apikey.
 */
const checkAuth = async (req, res, next) => {
  let apikey = req.get('x-api-key');

  if (req.query.apikey && !apikey) {
    apikey = req.query.apikey;
    req.headers['x-api-key'] = req.query.apikey;
  }

  if (!apikey) return next();

  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis]: Cannot get [${apikey}]`, err);
    return next();
  }

  let config;
  try {
    config = JSON.parse(apikeyConfig);
  } catch (err) {
    logger.error(`[redis]: Cannot parse [${apikeyConfig}]`, err);
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
