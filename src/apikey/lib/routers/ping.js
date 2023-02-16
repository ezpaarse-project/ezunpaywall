const router = require('express').Router();

const promiseWithTimeout = require('../controllers/ping');
const { pingRedis } = require('../services/redis');

router.get('/', (req, res) => res.status(200).json('apikey service'));

router.get('/ping', (req, res, next) => res.status(204).end());

router.get('/health', async (req, res, next) => {
  const start = Date.now();
  const p1 = promiseWithTimeout(pingRedis(), 'redis');

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
});

router.get('/health/redis', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');

  return res.status(200).json(resultPing);
});

module.exports = router;
