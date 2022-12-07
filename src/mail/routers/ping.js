const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');

const { pingSMTP } = require('../lib/mail');

router.get('/', async (req, res) => res.status(200).json('mail service'));

router.get('/ping', async (req, res, next) => res.status(200).json('pong'));

router.get('/health/smtp', async (req, res, next) => {
  const p1 = pingWithTimeout(pingSMTP(), 'smtp', 3000);

  const result = await Promise.all([p1]);

  return res.status(200).json(result);
});

router.get('/health', async (req, res, next) => {
  const p1 = pingWithTimeout(pingSMTP(), 'smtp', 3000);

  const result = await Promise.all([p1]);

  return res.status(200).json(result);
});

module.exports = router;
