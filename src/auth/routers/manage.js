const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');

router.get('/config', checkAuth, async (req, res) => {
  const apikey = req.get('X-API-KEY');
  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`Cannot get ${apikey} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  let config;
  try {
    config = JSON.parse(key);
  } catch (err) {
    logger.error(`Cannot parse ${key}`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(200).json({ config });
});

module.exports = router;
