const crypto = require('crypto');
const redis = require('redis');
const { format } = require('date-fns');

const { redisClient } = require('../services/redis');
const logger = require('../logger');

const createApiKey = async (config) => {
  const apikeyConfig = config;

  const currentDate = Date.now();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const id = hash;

  if (!apikeyConfig?.access) apikeyConfig.access = ['graphql'];
  if (!apikeyConfig?.attributes) apikeyConfig.attributes = ['*'];
  if (!apikeyConfig?.owner) apikeyConfig.owner = '';
  if (!apikeyConfig?.description) apikeyConfig.description = '';
  if (typeof apikeyConfig?.allowed !== 'boolean') apikeyConfig.allowed = true;
  apikeyConfig.createdAt = format(new Date(), 'yyyy-MM-dd');

  try {
    await redisClient.set(id, `${JSON.stringify(apikeyConfig)}`);
  } catch (err) {
    logger.error(`Cannot create apikey [${id}] for [${apikeyConfig.name}]`);
    return Promise.reject(err);
  }
  return id;
};

const updateApiKey = async (id, newConfig) => {
  const {
    name, access, owner, description, attributes, allowed,
  } = newConfig;

  let config = await redisClient.get(id);
  config = JSON.parse(config);

  if (name) config.name = name;
  if (access) config.access = access;
  if (attributes) config.attributes = attributes;
  if (typeof owner === 'string') config.owner = owner;
  if (typeof description === 'string') config.description = description;
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
