const {
  getStatus,
} = require('../controllers/status');

/**
 * Middleware that blocks simultaneous updates of unpaywall data.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
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
