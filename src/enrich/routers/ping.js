const router = require('express').Router();
const { pingRedis } = require('../lib/service/redis');
const { pingGraphql } = require('../lib/service/graphql');

const myPromise = require('../bin/utils');

router.get('/', async (req, res) => res.status(200).json('enrich service'));

router.get('/ping', async (req, res, next) => res.status(200).json());

router.get('/health/redis', async (req, res, next) => {
  const start = Date.now();

  let status;
  try {
    status = await myPromise(3000, async (resolve, reject) => {
      const resultPing = await pingRedis();
      if (resultPing) return resolve(true);
      return reject(false);
    });
  } catch (err) {
    const end = Date.now();
    return res.status(200).json({
      name: 'redis', status: false, elapsedTime: end - start, error: err?.message,
    });
  }

  const end = Date.now();

  return res.status(200).json({
    name: 'redis', status, elapsedTime: end - start,
  });
});

router.get('/health/graphql', async (req, res, next) => {
  const start = Date.now();

  let status;
  try {
    status = await myPromise(3000, async (resolve, reject) => {
      const resultPing = await pingGraphql();
      if (resultPing) return resolve(true);
      return reject(false);
    });
  } catch (err) {
    return res.status(200).json({
      name: 'graphql', status: false, elapsedTime: 3000, error: 'Time out',
    });
  }

  const end = Date.now();

  return res.status(200).json({
    name: 'graphql', status, elapsedTime: end - start,
  });
});

module.exports = router;
