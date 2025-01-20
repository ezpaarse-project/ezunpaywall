const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const getConfigController = require('../controllers/config');

/**
 * Route that get app config without secret.
 * Auth required.
 */
router.get('/config', checkAdmin, getConfigController);

module.exports = router;
