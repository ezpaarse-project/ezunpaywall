const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');

const { pingSMTP } = require('../lib/mail');

router.get('/', (req, res) => res.status(200).json('mail service'));

router.get('/ping', (req, res, next) => res.status(200).json('pong'));

router.get('/health/smtp', async (req, res, next) => {
  const resultPing = await pingWithTimeout(pingSMTP(), 'smtp', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health', async (req, res, next) => {
  const p1 = pingWithTimeout(pingSMTP(), 'smtp', 3000);

  const result = await Promise.allSettled([p1]);

  return res.status(200).json(result.map((e) => e.value));
});

module.exports = router;
