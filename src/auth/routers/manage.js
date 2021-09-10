const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const checkAuth = require('../middlewares/auth');
const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');

/**
 * get the most recent state in JSON format
 *
 * @return state
 */
router.get('/config', checkAuth(), async (req, res, next) => {
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
