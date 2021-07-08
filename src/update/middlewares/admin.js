const config = require('config');
const { logger } = require('../lib/logger');

let apikeyadmin = config.get('apikeyadmin');
try {
  apikeyadmin = JSON.parse(apikeyadmin);
} catch (err) {
  logger.error(`JSON.parse in admin.js - ${err}`);
}

/**
 * check the admin's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAdmin = (req, res, next) => {
  if (!apikeyadmin.includes(req.get('X-API-KEY'))) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAdmin,
};
