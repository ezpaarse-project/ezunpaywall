const { getStatus, setStatus } = require('../../lib/update/status');

/**
 * Controller to get status of update.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function getUpdateStatusController(req, res) {
  const status = getStatus();
  return res.status(200).json(status);
}

/**
 * Controller to update status of update.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function patchUpdateStatusController(req, res) {
  const status = setStatus();
  setStatus(!status);
  return res.status(200).json(!status);
}

module.exports = {
  getUpdateStatusController,
  patchUpdateStatusController,
};
