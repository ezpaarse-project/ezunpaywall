const router = require('express').Router();

const checkAdmin = require('../../middlewares/admin');
const { getStatus, setStatus } = require('../../lib/update/status');

/**
 * Route that indicate if an update is in progress.
 */
router.get('/job/status', (req, res) => {
  const status = getStatus();
  return res.status(200).json(status);
});

/**
 * Route that reverses the status.
 * Auth required.
 */
router.patch('/job/status', checkAdmin, (req, res) => {
  const status = setStatus();
  setStatus(!status);
  return res.status(200).json(!status);
});

module.exports = router;
