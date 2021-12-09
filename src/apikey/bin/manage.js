const crypto = require('crypto');
const redis = require('redis');
const { redisClient } = require('../lib/redis');
const logger = require('../lib/logger');

const createApiKey = async (name, access, attributes, allowed) => {
  const currentDate = Date.now();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const id = hash;

  const config = {
    name,
    access,
    attributes,
    allowed,
  };

  if (!config?.access) config.access = ['graphql'];
  if (!config?.attributes) config.attributes = ['*'];
  if (typeof config?.allowed !== 'boolean') config.allowed = true;

  try {
    await redisClient.set(id, `${JSON.stringify(config)}`);
  } catch (err) {
    logger.error(`Cannot create apikey [${id}] for [${name}]`);
    return Promise.reject(err);
  }
  return id;
};

const updateApiKey = async (id, name, access, attributes, allowed) => {
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
    return Promise.reject(err);
  }
};

const deleteApiKey = async (id) => {
  await redisClient.del(id, redis.print);
};

module.exports = {
  createApiKey,
  updateApiKey,
  deleteApiKey,
};
