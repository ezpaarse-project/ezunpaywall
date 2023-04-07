const router = require('express').Router();
const joi = require('joi').extend(require('@hapi/joi-date'));

const checkAuth = require('../middlewares/auth');

const cron = require('../controllers/cron/update');

/**
 * Route that start the update cron.
 * Auth required.
 */
router.post('/cron/start', checkAuth, async (req, res, next) => {
  cron.updateCron.start();

  return res.status(202).json();
});

/**
 * Route that stop the update cron.
 * Auth required.
 */
router.post('/cron/stop', checkAuth, async (req, res, next) => {
  cron.updateCron.stop();

  return res.status(202).json();
});

/**
 * Route that update the update cron.
 * Auth required.
 *
 * This route need a body that contains a config of cron.
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
 */
router.get('/cron', async (req, res) => {
  const config = cron.getGlobalConfig();

  return res.status(200).json(config);
});

module.exports = router;
