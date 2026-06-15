const router = require('express').Router();
const cronValidator = require('cron-validator');

const checkAdmin = require('../middlewares/admin');
const { validateCronConfig, validateCronType } = require('../middlewares/format/cron');

const dataUpdateCron = require('../cron/dataUpdate');
const cleanFileCron = require('../cron/cleanFile');
const downloadSnapshotCron = require('../cron/downloadSnapshot');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/:type/start', checkAdmin, validateCronType, (req, res, next) => {
  const { type } = req.data;

  try {
    if (type === 'dataUpdate') {
      dataUpdateCron.cron.start();
    }
    if (type === 'cleanFile') {
      cleanFileCron.cron.start();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.start();
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
    if (type === 'dataUpdate') {
      dataUpdateCron.cron.stop();
    }
    if (type === 'cleanFile') {
      cleanFileCron.cron.stop();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.stop();
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
    if (type === 'dataUpdate') {
      dataUpdateCron.update(cronConfig);
      config = dataUpdateCron.getGlobalConfig();
    }
    if (type === 'cleanFile') {
      cleanFileCron.update(cronConfig);
      config = cleanFileCron.getGlobalConfig();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.update(cronConfig);
      config = downloadSnapshotCron.config();
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

  if (type === 'dataUpdate') {
    config = dataUpdateCron.getGlobalConfig();
  }

  if (type === 'cleanFile') {
    config = cleanFileCron.getGlobalConfig();
  }

  if (type === 'downloadSnapshot') {
    config = downloadSnapshotCron.config;
  }

  return res.status(200).json(config);
});

module.exports = router;
