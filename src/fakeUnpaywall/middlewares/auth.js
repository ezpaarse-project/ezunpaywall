const boom = require('@hapi/boom');
/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const { api_key } = req.query;

  if (!api_key) {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  if (api_key !== 'default') {
    return res.status(401).json(boom.unauthorized('Not Authorized'));
  }

  return next();
};

module.exports = checkAuth;
