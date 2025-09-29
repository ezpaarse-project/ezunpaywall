const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const diskController = require('../controllers/disk');

/**
 * Route that get disk space.
 * Auth required.
 */
router.get('/disk', checkAdmin, diskController);

module.exports = router;
