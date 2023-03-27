/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches default used as password.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 * @param {function} next - Function that do the following in error handler.
 *
 * @returns {Object|function} HTTP response or next.
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const { api_key } = req.query;

  if (!api_key) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (api_key !== 'default') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
