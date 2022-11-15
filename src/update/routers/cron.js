const router = require('express').Router();
const joi = require('joi').extend(require('@hapi/joi-date'));

const checkAuth = require('../middlewares/auth');

const updateCron = require('../bin/cron/update');

router.post('/cron/start', checkAuth, async (req, res, next) => {
  updateCron.cron.start();

  return res.status(202).json();
});

router.post('/cron/stop', checkAuth, async (req, res, next) => {
  updateCron.cron.stop();

  return res.status(202).json();
});

router.patch('/cron', checkAuth, async (req, res, next) => {
  const { error, value } = joi.object({
    time: joi.string().trim(),
    index: joi.string().trim(),
    interval: joi.string().trim().valid('day', 'week'),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const { time, index, interval } = value;

  updateCron.update({ time, index, interval });

  const config = updateCron.getGlobalConfig();

  return res.status(200).json(config);
});

router.get('/cron', async (req, res, next) => {
  const config = updateCron.getGlobalConfig();

  return res.status(200).json(config);
});

module.exports = router;
