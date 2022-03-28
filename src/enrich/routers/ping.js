const router = require('express').Router();
const boom = require('@hapi/boom');
const { pingRedis } = require('../lib/redis');

router.get('/', async (req, res) => res.status(200).json('enrich service'));

router.get('/ping', async (req, res, next) => res.status(200).json(true));

router.get('/ping/redis', async (req, res, next) => {
  let redis;
  try {
    redis = await pingRedis();
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(200).json(redis);
});

module.exports = router;
