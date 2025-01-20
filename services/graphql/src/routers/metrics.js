const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const { setMetrics } = require('../lib/metrics');

/**
 * Route that force update metrics.
 * Auth required.
 */
router.post('/metrics', checkAdmin, (req, res) => {
  setMetrics();
  return res.status(202).end();
});

module.exports = router;
