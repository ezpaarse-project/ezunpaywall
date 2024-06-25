const { redisClient } = require('../services/redis');

const logger = require('../logger/appLogger');

/**
 * Authentication middleware that checks if if the arguments passed
 * in the body match the rights of the API key.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 *
 * This middleware need a body that contains the args of enrich.
 *
 * @returns {
 *  Promise<import('express').NextFunction> |
 *  Promise<import('express').Request>
 * } next - Do the following.
 */
async function checkArgs(req, res, next) {
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

  let { args } = req.body;

  if (!apikeyConfig?.attributes?.includes('*')) {
    if (args) {
      let error = false;
      const errors = [];
      args = args.substr(1);
      args = args.substring(0, args.length - 1);
      args = args.replace(/{/g, '.');
      args = args.replace(/}/g, '');
      args = args.replace(/ /g, '');
      args = args.split(',');

      args.forEach((attribute) => {
        if (!apikeyConfig?.attributes?.includes(attribute)) {
          error = true;
          errors.push(attribute);
        }
      });
      if (error) {
        return res.status(401).json({ message: `You don't have access to "${errors.join(',')}" attribute(s)` });
      }
    }
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
}

module.exports = checkArgs;
