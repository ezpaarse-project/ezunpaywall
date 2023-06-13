const cron = require('../cron/update');

/**
 * Controller to start update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function startUpdateCron(req, res, next) {
  try {
    cron.updateCron.start();
  } catch (err) {
    return next(err);
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
function stopUpdateCron(req, res, next) {
  try {
    cron.updateCron.stop();
  } catch (err) {
    return next(err);
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
function patchUpdateCron(req, res, next) {
  const value = req.data;
  const { time, index, interval } = value;
  try {
    cron.update({ time, index, interval });
  } catch (err) {
    return next(err);
  }

  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
}

/**
 * Controller to get config of update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function getConfigOfUpdateCron(req, res) {
  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
}
module.exports = {
  startUpdateCron,
  stopUpdateCron,
  patchUpdateCron,
  getConfigOfUpdateCron,
};
