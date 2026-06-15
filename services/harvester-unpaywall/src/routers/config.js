const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const { getConfig } = require('../lib/config');
/**
 * Route that get app config without secret.
 * Auth required.
 */
router.get('/config', checkAdmin, async (req, res) => {
  const config = getConfig();
  return res.status(200).json(config);
});

module.exports = router;
