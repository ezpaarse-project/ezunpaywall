const {
  getStatus,
} = require('../status');

/**
 * Middleware that blocks simultaneous updates of unpaywall data.
 */
const checkStatus = (req, res, next) => {
  const status = getStatus();
  if (status) {
    return res.status(409).json({ message: 'Update in progress' });
  }
  return next();
};

module.exports = checkStatus;
