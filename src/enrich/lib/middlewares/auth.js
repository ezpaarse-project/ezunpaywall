const { redisClient } = require('../services/redis');

const logger = require('../logger');

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
    return res.status(401).json({ message: 'Not authorized' });
  }

  let apikeyConfig;
  try {
    apikeyConfig = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis] Cannot get [${apikey}] on redis`, err);
    return next({ message: err.message });
  }

  try {
    apikeyConfig = JSON.parse(apikeyConfig);
  } catch (err) {
    logger.error(`[redis] Cannot parse [${apikeyConfig}]`, err);
    return next({ message: err.message });
  }

  if (!Array.isArray(apikeyConfig?.access) || !apikeyConfig?.access?.includes('enrich') || !apikeyConfig?.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  let { args } = req.body;

  if (!apikeyConfig.attributes?.includes('*')) {
    if (!args) {
      return res.status(401).json({ message: 'Not authorized' });
    }
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

  return next();
};

module.exports = checkAuth;
