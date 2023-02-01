const router = require('express').Router();

const promiseWithTimeout = require('../bin/ping');

const { pingSMTP } = require('../lib/mail');

router.get('/', (req, res) => res.status(200).json('mail service'));

router.get('/ping', (req, res, next) => res.status(204).end());

router.get('/health', async (req, res, next) => {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingSMTP(), 'smtp', 3000);

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const status = resultPing.every((e) => e?.status);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, status });
});

router.get('/health/smtp', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingSMTP(), 'smtp', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health/smtp', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingSMTP(), 'smtp', 3000);

  return res.status(200).json(resultPing);
});

module.exports = router;
