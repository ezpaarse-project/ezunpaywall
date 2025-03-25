const cronValidator = require('cron-validator');

const dataUpdateCron = require('../cron/dataUpdate');
const dataUpdateHistoryCron = require('../cron/dataUpdateHistory');
const cleanFileCron = require('../cron/cleanFile');
const demoApiKeyCron = require('../cron/demoApikey');
const downloadSnapshotCron = require('../cron/downloadSnapshot');

/**
 * Controller to start update cron.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function startCronController(req, res, next) {
  const { type } = req.data;

  try {
    if (type === 'dataUpdate') {
      dataUpdateCron.cron.start();
    }
    if (type === 'dataUpdateHistory') {
      dataUpdateHistoryCron.cron.start();
    }
    if (type === 'cleanFile') {
      cleanFileCron.cron.start();
    }
    if (type === 'demoApiKey') {
      demoApiKeyCron.cron.start();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.start();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(202).json();
}

/**
 * Controller to stop update cron.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function stopCronController(req, res, next) {
  const { type } = req.data;

  try {
    if (type === 'dataUpdate') {
      dataUpdateCron.cron.stop();
    }
    if (type === 'dataUpdateHistory') {
      dataUpdateHistoryCron.cron.stop();
    }
    if (type === 'cleanFile') {
      cleanFileCron.cron.stop();
    }
    if (type === 'demoApiKey') {
      demoApiKeyCron.cron.stop();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.stop();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(202).json();
}

/**
 * Controller to update config of update cron.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function patchCronController(req, res, next) {
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
    if (type === 'dataUpdateHistory') {
      dataUpdateHistoryCron.update(cronConfig);
      config = dataUpdateHistoryCron.getGlobalConfig();
    }
    if (type === 'cleanFile') {
      cleanFileCron.update(cronConfig);
      config = cleanFileCron.getGlobalConfig();
    }
    if (type === 'demoApiKey') {
      demoApiKeyCron.update(cronConfig);
      config = demoApiKeyCron.getGlobalConfig();
    }
    if (type === 'downloadSnapshot') {
      downloadSnapshotCron.update(cronConfig);
      config = downloadSnapshotCron.config();
    }
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(config);
}

/**
 * Controller to get config of update cron.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function getConfigCronController(req, res) {
  const { type } = req.data;

  let config;

  if (type === 'dataUpdate') {
    config = dataUpdateCron.getGlobalConfig();
  }

  if (type === 'dataUpdateHistory') {
    config = dataUpdateHistoryCron.getGlobalConfig();
  }

  if (type === 'cleanFile') {
    config = cleanFileCron.getGlobalConfig();
  }

  if (type === 'demoApiKey') {
    config = demoApiKeyCron.getGlobalConfig();
  }

  if (type === 'downloadSnapshot') {
    config = downloadSnapshotCron.config;
  }

  return res.status(200).json(config);
}
module.exports = {
  startCronController,
  stopCronController,
  patchCronController,
  getConfigCronController,
};
