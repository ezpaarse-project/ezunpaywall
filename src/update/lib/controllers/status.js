let inUpdate = false;

/**
 * Setter of inUpdate.
 *
 * @param {boolean} status - indicates if a job is in progress.
 */
const setInUpdate = (status) => {
  inUpdate = status;
};

/**
 * Getter of inUpdate.
 *
 * @returns {boolean} - inUpdate
 */
const getStatus = () => inUpdate;

module.exports = {
  setInUpdate,
  getStatus,
};
