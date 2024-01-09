const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const validateCronConfig = require('../middlewares/format/cron');

const {
  startUpdateCron,
  stopUpdateCron,
  patchUpdateCron,
  getConfigOfUpdateCron,
} = require('../controllers/cron');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/start', checkAuth, startUpdateCron);

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/stop', checkAuth, stopUpdateCron);

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron', checkAuth, validateCronConfig, patchUpdateCron);

/**
 * Route that get the config of update cron.
 */
router.get('/cron', getConfigOfUpdateCron);

module.exports = router;
