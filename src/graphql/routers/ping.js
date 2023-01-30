const router = require('express').Router();

const promiseWithTimeout = require('../bin/ping');
const { pingRedis } = require('../lib/service/redis');
const { pingElastic } = require('../lib/service/elastic');

router.get('/', (req, res) => res.status(200).json('graphql service'));

router.get('/ping', (req, res, next) => res.status(204).end());

router.get('/health', async (req, res, next) => {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingRedis(), 'redis', 3000);
  const p2 = promiseWithTimeout(pingElastic(), 'elastic', 3000);

  let resultPing = await Promise.allSettled([p1, p2]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
});

router.get('/health/redis', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health/elastic', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingElastic(), 'elastic', 3000);

  return res.status(200).json(resultPing);
});

module.exports = router;
