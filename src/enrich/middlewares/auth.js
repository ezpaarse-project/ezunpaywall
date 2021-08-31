const apiKeyUser = require('../apikey.json');

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
  if (!apiKeyUser[apikey]) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!apiKeyUser[apikey].access.includes('enrich')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAuth,
};
