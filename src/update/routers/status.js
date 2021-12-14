const router = require('express').Router();

const { getStatus } = require('../bin/status');

/**
 * @return status
 */
router.get('/status', (req, res) => {
  const status = getStatus();
  return res.status(200).json(status);
});

module.exports = router;
