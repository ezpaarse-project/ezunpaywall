const router = require('express').Router();
const { pingRedis } = require('../lib/service/redis');
const { elasticClient } = require('../lib/service/elastic');

router.get('/', async (req, res) => res.status(200).json({ message: 'update service' }));

router.get('/ping', async (req, res, next) => res.status(200).json({ message: true }));

router.get('/ping/redis', async (req, res, next) => {
  let redis;
  try {
    redis = await pingRedis();
  } catch (err) {
    return next({ message: 'Cannot ping redis', stackTrace: err });
  }
  return res.status(200).json({ message: redis });
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
