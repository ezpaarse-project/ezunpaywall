const config = require('config');
const logger = require('../lib/logger');

let apikeyusers = config.get('apikeyusers');
try {
  apikeyusers = JSON.parse(apikeyusers);
} catch (err) {
  logger.error(`Cannot parse ${apikeyusers} in json format`);
  logger.error(err);
}
/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = (req, res, next) => {
  if (!apikeyusers.includes(req.get('X-API-KEY'))) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAuth,
};
