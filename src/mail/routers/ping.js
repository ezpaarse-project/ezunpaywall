const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');

const { pingSMTP } = require('../lib/mail');

router.get('/', (req, res) => res.status(200).json('mail service'));

router.get('/ping', (req, res, next) => res.status(204).end());

router.get('/health/smtp', async (req, res, next) => {
  const resultPing = await pingWithTimeout(pingSMTP(), 'smtp', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health', async (req, res, next) => {
  const p1 = pingWithTimeout(pingSMTP(), 'smtp', 3000);

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, status: e?.status, error: e?.error };
  });

  return res.status(200).json(result);
});

module.exports = router;
