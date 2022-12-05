const router = require('express').Router();

const myPromise = require('../bin/utils');

const { pingRedis } = require('../lib/service/redis');
const { pingElastic } = require('../lib/service/elastic');

router.get('/', async (req, res) => res.status(200).json('graphql service'));

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
  const start = Date.now();

  try {
    await pingElastic();
  } catch (err) {
    return next({ message: err });
  }

  const end = Date.now();

  return res.status(200).json(end - start);
});

module.exports = router;
