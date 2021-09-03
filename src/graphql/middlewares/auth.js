const redisClient = require('../lib/redis');
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
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!Array.isArray(config?.access) || !config.access.includes('graphql') || !config.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  let args;
  args = req.query;

  if (!args) {
    args = req.body;
  }

  args = JSON.stringify(args);

  if (args === '{}') return next();

  args = args.split(')');
  [, args] = args;
  args = args.replace(/ /g, '');
  args = args.substring(0, args.length - 3);

  if (config.attributes !== '*') {
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
      if (!config.attributes.includes(attribute)) {
        error = true;
        errors.push(attribute);
      }
    });
    if (error) {
      return res.status(401).json({ message: `You don't have access to "${errors.join(',')}" attribute(s)` });
    }
  }
  req.attributes = config.attributes;
  return next();
};

module.exports = {
  checkAuth,
};
