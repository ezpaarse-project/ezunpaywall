const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');
const { validateCronConfig, validateCronType } = require('../middlewares/cron');

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
router.post('/cron/:type/start', checkAdmin, validateCronType, startCronController);

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/:type/stop', checkAdmin, validateCronType, stopCronController);

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron/:type', checkAdmin, validateCronType, validateCronConfig, patchCronController);

/**
 * Route that get the config of update cron.
 */
router.get('/cron/:type', validateCronType, getConfigCronController);

module.exports = router;
