const router = require('express').Router();

const checkAdmin = require('../../middlewares/admin');
const { getUpdateStatusController, patchUpdateStatusController } = require('../../controllers/update/status');

/**
 * Route that indicate if an update is in progress.
 */
router.get('/job/status', getUpdateStatusController);

/**
 * Route that reverses the status.
 * Auth required.
 */
router.patch('/job/status', checkAdmin, patchUpdateStatusController);

module.exports = router;
