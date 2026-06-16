const router = require('express').Router();
const cronValidator = require('cron-validator');

const checkAdmin = require('../middlewares/admin');
const { validateCronConfig, validateCronType } = require('../middlewares/cron');

const cleanFileCron = require('../cron/cleanFile');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/:type/start', checkAdmin, validateCronType, (req, res, next) => {
  const { type } = req.data;

  try {
    if (type === 'cleanFile') {
      cleanFileCron.cron.start();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(202).json();
});

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/:type/stop', checkAdmin, validateCronType, (req, res, next) => {
  const { type } = req.data;

  try {
    if (type === 'cleanFile') {
      cleanFileCron.cron.stop();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(202).json();
});

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
 */
router.patch('/cron/:type', checkAdmin, validateCronType, validateCronConfig, (req, res, next) => {
  const { cronConfig, type } = req.data;
  const { schedule } = cronConfig;

  if (schedule) {
    const validCron = cronValidator.isValidCron(schedule, { seconds: true });
    if (!validCron) { return res.status(400).json('Schedule is invalid'); }
  }

  let config;

  try {
    if (type === 'cleanFile') {
      cleanFileCron.update(cronConfig);
      config = cleanFileCron.getGlobalConfig();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(config);
});

/**
 * Route that get the config of update cron.
 */
router.get('/cron/:type', validateCronType, (req, res) => {
  const { type } = req.data;

  let config;

  if (type === 'cleanFile') {
    config = cleanFileCron.getGlobalConfig();
  }

  return res.status(200).json(config);
});

module.exports = router;
