const router = require('express').Router();

const checkAuth = require('../../middlewares/auth');
const { getUpdateStatus, patchUpdateStatus } = require('../controllers/status');

/**
 * Route that indicate if an update is in progress.
 */
router.get('/status', getUpdateStatus);

/**
 * Route that reverses the status.
 * Auth required.
 */
router.patch('/status', checkAuth, patchUpdateStatus);

module.exports = router;
