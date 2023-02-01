const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { getStatus, setInUpdate } = require('../controllers/status');

/**
 * @return status
 */
router.get('/status', (req, res) => {
  const status = getStatus();
  return res.status(200).json(status);
});

router.patch('/status', checkAuth, (req, res) => {
  const status = getStatus();
  setInUpdate(!status);
  return res.status(200).json(!status);
});

module.exports = router;
