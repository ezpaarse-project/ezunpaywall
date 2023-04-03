const router = require('express').Router();
const joi = require('joi').extend(require('@hapi/joi-date'));

const checkAuth = require('../middlewares/auth');

const cron = require('../controllers/cron/update');

/**
 * Route that start the update cron.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/cron/start', checkAuth, async (req, res, next) => {
  cron.updateCron.start();

  return res.status(202).json();
});

/**
 * Route that stop the update cron.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/cron/stop', checkAuth, async (req, res, next) => {
  cron.updateCron.stop();

  return res.status(202).json();
});

/**
 * Route that update the update cron.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeBody {string} time - Schedule of cron.
 * @routeBody {string} index - Index where the data will be inserted.
 * @routeBody {string} interval - Interval of changefile, day or week are available.
 *
 * @routeResponse {Object} config - Config of cron.
 *
 * @return {import('express').Response} HTTP response.
 */
router.patch('/cron', checkAuth, async (req, res) => {
  const { error, value } = joi.object({
    time: joi.string().trim(),
    index: joi.string().trim(),
    interval: joi.string().trim().valid('day', 'week'),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const { time, index, interval } = value;

  cron.update({ time, index, interval });

  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
});

/**
 * Route that get the config of update cron.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Object} config of update cron.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/cron', async (req, res) => {
  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
});

module.exports = router;
