const cronValidator = require('cron-validator');
const unpaywallCron = require('../cron/unpaywall');
const unpaywallHistoryCron = require('../cron/unpaywallHistory');

/**
 * Controller to start update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function startCron(req, res, next) {
  const { type } = req.data;

  if (type === 'unpaywall') {
    try {
      unpaywallCron.cron.start();
    } catch (err) {
      return next(err);
    }
  }

  if (type === 'unpaywallHistory') {
    try {
      unpaywallHistoryCron.cron.start();
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

  if (type === 'unpaywall') {
    try {
      unpaywallCron.cron.stop();
    } catch (err) {
      return next(err);
    }
  }

  if (type === 'unpaywallHistory') {
    try {
      unpaywallHistoryCron.cron.stop();
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
  const { time, index, interval } = cronConfig;

  if (time) {
    const validCron = cronValidator.isValidCron(time, { seconds: true });
    if (!validCron) { return res.status(400).json('schedule is invalid'); }
  }

  let config;

  if (type === 'unpaywall') {
    try {
      unpaywallCron.update({ time, index, interval });
    } catch (err) {
      return next(err);
    }
    config = unpaywallCron.getGlobalConfig();
  }

  if (type === 'unpaywallHistory') {
    try {
      unpaywallHistoryCron.update({ time, index, interval });
    } catch (err) {
      return next(err);
    }
    config = unpaywallHistoryCron.getGlobalConfig();
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

  if (type === 'unpaywall') {
    config = unpaywallCron.getGlobalConfig();
  }

  if (type === 'unpaywallHistory') {
    config = unpaywallHistoryCron.getGlobalConfig();
  }

  return res.status(200).json(config);
}
module.exports = {
  startCron,
  stopCron,
  patchCron,
  getConfigCron,
};
