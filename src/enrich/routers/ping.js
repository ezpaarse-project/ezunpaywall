const router = require('express').Router();

const pingWithTimeout = require('../bin/ping');
const { pingRedis } = require('../lib/service/redis');
const { pingGraphql } = require('../lib/service/graphql');

router.get('/', async (req, res) => res.status(200).json('enrich service'));

router.get('/ping', async (req, res, next) => res.status(200).json('pong'));

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

  const result = await Promise.all([p1, p2]);

  return res.status(200).json(result);
});

module.exports = router;
