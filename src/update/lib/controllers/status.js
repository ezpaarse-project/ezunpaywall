const { getStatus, setInUpdate } = require('../status');

function getUpdateStatus(req, res) {
  const status = getStatus();
  return res.status(200).json(status);
}

function patchUpdateStatus(req, res) {
  const status = setInUpdate();
  setInUpdate(!status);
  return res.status(200).json(!status);
}

module.exports = {
  getUpdateStatus,
  patchUpdateStatus,
};
