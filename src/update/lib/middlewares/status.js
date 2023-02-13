const {
  getStatus,
} = require('../controllers/status');

/**
 * middleware that blocks simultaneous updates of unpaywall data
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkStatus = (req, res, next) => {
  const status = getStatus();
  if (status) {
    return res.status(409).json({ message: 'Update in progress' });
  }
  return next();
};

module.exports = checkStatus;
