const config = require('config');

/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = (req, res, next) => {
  // TODO check in query
  const apikey = req.get('redis-password');

  if (apikey !== config.get('redis.password')) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
