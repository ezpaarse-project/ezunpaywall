const router = require('express').Router();
const boom = require('@hapi/boom');

const {
  pingElastic,
} = require('../service/elastic');

const {
  pingRedis,
} = require('../service/redis');

router.get('/ping', async (req, res) => res.status(200).json({}));

router.get('/ping/redis', async (req, res, next) => {
  let ping;
  try {
    ping = await pingRedis();
  } catch (err) {
    return next(boom.boomify(err));
  }
  if (ping) {
    return res.status(200).json('OK');
  }
  return next(boom.serverUnavailable());
});

router.get('/ping/elastic', async (req, res, next) => {
  let ping;
  try {
    ping = await pingElastic();
  } catch (err) {
    return next(boom.boomify(err));
  }
  if (ping) {
    return res.status(200).json('OK');
  }
  return next(boom.serverUnavailable());
});

module.exports = router;