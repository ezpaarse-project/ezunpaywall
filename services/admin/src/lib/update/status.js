const appLogger = require('../logger/appLogger');

let status = false;

/**
 * Setter of inUpdate.
 *
 * @param {boolean} status - indicates if a job is in progress.
 */
function setStatus(newStatus) {
  status = newStatus;
  appLogger.info(`[status]: status is updated to [${newStatus}]`);
}

/**
 * Getter of inUpdate.
 *
 * @returns {boolean} inUpdate
 */
function getStatus() {
  return status;
}

module.exports = {
  setStatus,
  getStatus,
};
