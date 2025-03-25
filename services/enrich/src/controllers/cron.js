const cronValidator = require('cron-validator');

const cleanFileCron = require('../cron/cleanFile');

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
    if (type === 'cleanFile') {
      cleanFileCron.cron.start();
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
    if (type === 'cleanFile') {
      cleanFileCron.cron.stop();
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
    if (type === 'cleanFile') {
      cleanFileCron.update(cronConfig);
      config = cleanFileCron.getGlobalConfig();
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

  if (type === 'cleanFile') {
    config = cleanFileCron.getGlobalConfig();
  }

  return res.status(200).json(config);
}
module.exports = {
  startCronController,
  stopCronController,
  patchCronController,
  getConfigCronController,
};
