const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');
const { pingRedis } = require('../lib/service/redis');
const { pingGraphql } = require('../lib/service/graphql');

router.get('/', (req, res) => res.status(200).json('enrich service'));

router.get('/ping', (req, res, next) => res.status(200).json('pong'));

router.get('/health/redis', async (req, res, next) => {
  const resultPing = await pingWithTimeout(pingRedis(), 'redis', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health/graphql', async (req, res, next) => {
  const resultPing = await pingWithTimeout(pingGraphql(), 'graphql', 3000);

  return res.status(200).json(resultPing);
});

router.get('/health', async (req, res, next) => {
  const p1 = pingWithTimeout(pingRedis(), 'redis', 3000);
  const p2 = pingWithTimeout(pingGraphql(), 'graphql', 3000);

  let resultPing = await Promise.allSettled([p1, p2]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, status: e?.status, error: e?.error };
  });

  return res.status(200).json(result);
});

module.exports = router;
