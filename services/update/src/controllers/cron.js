const cronValidator = require('cron-validator');
const dataUpdate = require('../cron/dataUpdate');
const dataUpdateHistoryCron = require('../cron/dataUpdateHistory');

/**
 * Controller to start update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function startCron(req, res, next) {
  const { type } = req.data;

  if (type === 'dataUpdate') {
    try {
      dataUpdate.cron.start();
    } catch (err) {
      return next(err);
    }
  }

  if (type === 'dataUpdateHistory') {
    try {
      dataUpdateHistoryCron.cron.start();
    } catch (err) {
      return next(err);
    }
  }

  return res.status(202).json();
}

/**
 * Controller to stop update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function stopCron(req, res, next) {
  const { type } = req.data;

  if (type === 'dataUpdate') {
    try {
      dataUpdate.cron.stop();
    } catch (err) {
      return next(err);
    }
  }

  if (type === 'dataUpdateHistory') {
    try {
      dataUpdateHistoryCron.cron.stop();
    } catch (err) {
      return next(err);
    }
  }

  return res.status(202).json();
}

/**
 * Controller to update config of update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function patchCron(req, res, next) {
  const { cronConfig, type } = req.data;
  const { schedule } = cronConfig;

  if (schedule) {
    const validCron = cronValidator.isValidCron(schedule, { seconds: true });
    if (!validCron) { return res.status(400).json('schedule is invalid'); }
  }

  let config;

  if (type === 'dataUpdate') {
    try {
      dataUpdate.update(cronConfig);
    } catch (err) {
      return next(err);
    }

    config = dataUpdate.getGlobalConfig();
  }

  if (type === 'dataUpdateHistory') {
    try {
      dataUpdateHistoryCron.update(cronConfig);
    } catch (err) {
      return next(err);
    }
    config = dataUpdateHistoryCron.getGlobalConfig();
  }

  return res.status(200).json(config);
}

/**
 * Controller to get config of update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function getConfigCron(req, res) {
  const { type } = req.data;

  let config;

  if (type === 'dataUpdate') {
    config = dataUpdate.getGlobalConfig();
  }

  if (type === 'dataUpdateHistory') {
    config = dataUpdateHistoryCron.getGlobalConfig();
  }

  return res.status(200).json(config);
}
module.exports = {
  startCron,
  stopCron,
  patchCron,
  getConfigCron,
};
