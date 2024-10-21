const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');
const validateCronConfig = require('../middlewares/format/cron');
const { validateParamsType } = require('../middlewares/format/type');

const {
  startCronController,
  stopCronController,
  patchCronController,
  getConfigCronController,
} = require('../controllers/cron');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/:type/start', checkAdmin, validateParamsType, startCronController);

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/:type/stop', checkAdmin, validateParamsType, stopCronController);

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron/:type', checkAdmin, validateParamsType, validateCronConfig, patchCronController);

/**
 * Route that get the config of update cron.
 */
router.get('/cron/:type', validateParamsType, getConfigCronController);

module.exports = router;
