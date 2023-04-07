const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { getStatus, setInUpdate } = require('../controllers/status');

/**
 * Route that indicate if an update is in progress.
 */
router.get('/status', (req, res) => {
  const status = getStatus();
  return res.status(200).json(status);
});

/**
 * Route that reverses the status.
 * Auth required.
 */
router.patch('/status', checkAuth, (req, res) => {
  const status = getStatus();
  setInUpdate(!status);
  return res.status(200).json(!status);
});

module.exports = router;
