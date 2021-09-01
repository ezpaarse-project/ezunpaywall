const redisClient = require('../lib/redis');

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

  const key = await redisClient.get(apikey);
  const config = JSON.parse(key);

  if (!config) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!config.access.includes('enrich')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!config.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  let { args } = req.body;

  if (!config.attributes === '*') {
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

  return next();
};

module.exports = {
  checkAuth,
};
