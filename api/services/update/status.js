let inUpdate = false;

/**
 * setter of inUpdate
 * @param {Boolean} status - true: update in progress. false: no update in progress
 */
const setInUpdate = (status) => {
  inUpdate = status;
};

/**
 * getter of inUpdate
 * @returns {Boolean} - inUpdate
 */
const getStatus = () => inUpdate;

module.exports = {
  setInUpdate,
  getStatus,
};
