const router = require('express').Router();
const { pingRedis } = require('../lib/service/redis');

const logger = require('../lib/logger');

router.get('/', async (req, res) => res.status(200).json({ message: 'apikey service' }));

router.get('/ping', async (req, res, next) => res.status(200).json({ message: true }));

router.get('/ping/redis', async (req, res, next) => {
  let redis;
  try {
    redis = await pingRedis();
  } catch (err) {
    logger.error('Cannot ping redis');
    logger.error(err);
    return next({ message: 'Cannot ping redis', stackTrace: err });
  }
  return res.status(200).json({ message: redis });
});

module.exports = router;
