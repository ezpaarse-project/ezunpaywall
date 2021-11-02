const crypto = require('crypto');
const redis = require('redis');
const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');

const createAuth = async (name, access, attributes, allowed) => {
  const currentDate = (new Date()).valueOf().toString();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const id = hash;
  const config = {
    name,
    access,
    attributes,
    allowed,
  };

  try {
    await redisClient.set(id, `${JSON.stringify(config)}`);
  } catch (err) {
    logger.error(`Cannot create apikey [${id}] for [${name}]`);
    throw err;
  }
  return id;
};

const updateAuth = async (id, name, access, attributes, allowed) => {
  let config = await redisClient.get(id);
  config = JSON.parse(config);

  if (name) config.name = name;
  if (access) config.access = access;
  if (attributes) config.attributes = attributes;
  if (typeof allowed === 'boolean') config.allowed = allowed;

  try {
    await redisClient.set(id, `${JSON.stringify(config)}`);
  } catch (err) {
    logger.error(`Cannot update apikey [${id}] for [${name}]`);
    throw err;
  }
};

const deleteAuth = async (id) => {
  await redisClient.del(id, redis.print);
};

module.exports = {
  createAuth,
  updateAuth,
  deleteAuth,
};
