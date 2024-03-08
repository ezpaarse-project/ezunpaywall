const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const validateCronConfig = require('../middlewares/format/cron');
const { validateParamsType } = require('../middlewares/format/type');

const {
  startCron,
  stopCron,
  patchCron,
  getConfigCron,
} = require('../controllers/cron');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/:type/start', checkAuth, validateParamsType, startCron);

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/:type/stop', checkAuth, validateParamsType, stopCron);

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron/:type', checkAuth, validateParamsType, validateCronConfig, patchCron);

/**
 * Route that get the config of update cron.
 */
router.get('/cron/:type', validateParamsType, getConfigCron);

module.exports = router;
