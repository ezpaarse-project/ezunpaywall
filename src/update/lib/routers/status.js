const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { getStatus, setInUpdate } = require('../controllers/status');

/**
 * Route that indicate if an update is in progress.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {boolean} - Indicate if an update is in progress.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/status', (req, res) => {
  const status = getStatus();
  return res.status(200).json(status);
});

/**
 * Route that reverses the status.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {boolean} - Indicate if an update is in progress.
 *
 * @return {import('express').Response} HTTP response.
 */
router.patch('/status', checkAuth, (req, res) => {
  const status = getStatus();
  setInUpdate(!status);
  return res.status(200).json(!status);
});

module.exports = router;
