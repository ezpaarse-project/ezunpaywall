const config = require('config');

/**
 * check the admin's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAdmin = (req, res, next) => {
  let apikeyadmin = config.get('apikeyadmin');
  try {
    apikeyadmin = JSON.parse(apikeyadmin);
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error in JSON.parse(apikeyadmin)' });
  }

  if (!apikeyadmin.includes(req?.headers?.api_key)) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAdmin,
};
