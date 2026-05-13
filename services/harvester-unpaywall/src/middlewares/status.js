const {
  getStatus,
} = require('../lib/update/status');

/**
 * Middleware that blocks simultaneous updates of unpaywall data.
 */
const checkStatus = (req, res, next) => {
  const status = getStatus();
  if (status) {
    return res.status(409).json({ message: 'Work in progress' });
  }
  return next();
};

module.exports = checkStatus;
