const router = require('express').Router();

const myPromise = require('../bin/utils');
const { pingRedis } = require('../lib/service/redis');
const { elasticClient } = require('../lib/service/elastic');

router.get('/', async (req, res) => res.status(200).json('update service'));

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

router.get('/ping/elastic', async (req, res, next) => {
  let elastic;
  try {
    elastic = await elasticClient.ping();
  } catch (err) {
    return next({ message: 'Cannot ping elastic', stackTrace: err });
  }
  return res.status(200).json({ message: elastic });
});

module.exports = router;
