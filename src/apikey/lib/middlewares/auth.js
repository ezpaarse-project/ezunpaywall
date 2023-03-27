const { apikey } = require('config');

/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {function} next - Do the following in error handler.
 *
 * @returns {Object|function} HTTP response or next.
 */
const checkAuth = (req, res, next) => {
  const key = req.get('x-api-key');

  if (key !== apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
