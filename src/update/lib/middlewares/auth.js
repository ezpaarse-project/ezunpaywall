const { apikey } = require('config');

/**
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = (req, res, next) => {
  const key = req.get('x-api-key');

  if (key !== apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
