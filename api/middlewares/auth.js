const config = require('config');

/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = (req, res, next) => {
  let apikeyusers = config.get('apikeyusers');
  try {
    apikeyusers = JSON.parse(apikeyusers);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error in JSON.parse(apikeyusers)' });
  }

  if (!apikeyusers.includes(req?.headers?.api_key)) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAuth,
};
