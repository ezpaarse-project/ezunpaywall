const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const validateCronConfig = require('../middlewares/format/cron');
const validateType = require('../middlewares/format/type');

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
router.post('/cron/:type/start', checkAuth, validateType, startCron);

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/:type/stop', checkAuth, validateType, stopCron);

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron/:type', checkAuth, validateType, validateCronConfig, patchCron);

/**
 * Route that get the config of update cron.
 */
router.get('/cron/:type', validateType, getConfigCron);

module.exports = router;
