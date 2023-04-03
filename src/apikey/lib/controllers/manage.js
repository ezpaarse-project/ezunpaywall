const crypto = require('crypto');
const redis = require('redis');

const { redisClient } = require('../services/redis');
const logger = require('../logger');

/**
 * Create an apikey on redis according to its configuration.
 *
 * @param {string} name - Name of apikey.
 * @param {Array<string>} access - Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} attributes - Names of the unpaywall attributes.
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} allowed - Indicates if the key is authorized or not.
 *
 * @returns {string} The randomly generated API key.
 */
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

/**
 * Update an apikey on redis according to its key and its configuration.
 *
 * @param {string} id - Key of apikey.
 * @param {string} name - Name of apikey.
 * @param {Array<string>} access - Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} attributes - Names of the unpaywall attributes
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} allowed - Indicates if the key is authorized or not.
 *
 * @returns {Object} Config of apikey.
 */
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

  return config;
};

/**
 * Delete an apikey on redis according to its key.
 *
 * @param {string} id - key of apikey.
 */
const deleteApiKey = async (id) => {
  await redisClient.del(id, redis.print);
};

module.exports = {
  createApiKey,
  updateApiKey,
  deleteApiKey,
};
