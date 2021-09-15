const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');
const {
  createAuth,
  updateAuth,
  deleteAuth,
} = require('../bin/manage');

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

router.post('/keys/create', checkAuth, async (req, res, next) => {
  const { config } = req.body;

  let id;

  try {
    id = await createAuth(config.name, config.access, config.attributes, config.allowed);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ id });
});

router.pur('/keys/update', checkAuth, async (req, res, next) => {
  let { config } = req.body;

  const { id } = config;

  if (!id) {
    return res.status(400).json({ message: 'id expected' });
  }

  let key;
  try {
    key = await redisClient.get(id);
  } catch (err) {
    logger.error(`Cannot get ${id} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!key) {
    return res.status(404).json({ message: `[${id}] apikey doesn't exist` });
  }

  try {
    config = await updateAuth(id, config.name, config.access, config.attributes, config.allowed);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ config });
});

router.put('/keys/delete', checkAuth, async (req, res, next) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'id expected' });
  }

  let key;
  try {
    key = await redisClient.get(id);
  } catch (err) {
    logger.error(`Cannot get ${id} on redis`);
    logger.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }

  if (!key) {
    return res.status(404).json({ message: `[${id}] apikey doesn't exist` });
  }

  try {
    await deleteAuth(id);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ id });
});

module.exports = router;
