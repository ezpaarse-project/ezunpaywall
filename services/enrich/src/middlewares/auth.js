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
 *
 * @returns {
 *  Promise<import('express').NextFunction> |
 *  Promise<import('express').Request>
 * }
 */
async function checkAuth(req, res, next) {
  const apikey = req.get('x-api-key');

  if (!apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis]: Cannot get [${apikey}] on redis`, err);
    return next({ message: err.message });
  }

  try {
    apikeyConfig = JSON.parse(apikeyConfig);
  } catch (err) {
    logger.error(`[redis]: Cannot parse [${apikeyConfig}]`, err);
    return next({ message: err.message });
  }

  if (!Array.isArray(apikeyConfig?.access) || !apikeyConfig?.access?.includes('enrich') || !apikeyConfig?.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
}

module.exports = checkAuth;
