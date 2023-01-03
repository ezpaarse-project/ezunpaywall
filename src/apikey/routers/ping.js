const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');
const { pingRedis } = require('../lib/service/redis');

router.get('/', (req, res) => res.status(200).json('apikey service'));

router.get('/ping', (req, res, next) => res.status(204).end());

router.get('/health', async (req, res, next) => {
  const start = Date.now();
  const p1 = pingWithTimeout(pingRedis(), 'redis', 3000);

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, status: e?.status, error: e?.error };
  });

  const status = resultPing.every((e) => e?.status);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, status });
});

router.get('/health/redis', async (req, res, next) => {
  const resultPing = await pingWithTimeout(pingRedis(), 'redis', 3000);

  return res.status(200).json(resultPing);
});

module.exports = router;
