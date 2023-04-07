const crypto = require('crypto');
const redis = require('redis');
const { format } = require('date-fns');

const { redisClient } = require('../services/redis');
const logger = require('../logger');

/**
 * Create an apikey on redis according to its configuration.
 *
 * @param {Object} config - Config of apikey.
 * @param {string} config.name - Name of apikey.
 * @param {Array<string>} config.access - Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} config.attributes - Names of the unpaywall attributes.
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} config.allowed - Indicates if the key is authorized or not.
 *
 * @returns {Promise<string>} The randomly generated API key.
 */
async function createApiKey(config) {
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
    logger.error(`[redis] Cannot create apikey [${id}] for [${apikeyConfig.name}]`, err);
    throw err;
  }
  return id;
}

/**
 * Update an apikey on redis according to its key and its configuration.
 *
 * @param {string} id - Key of apikey.
 * @param {Object} newConfig - New config of apikey.
 * @param {string} newConfig.name - Name of apikey.
 * @param {Array<string>} newConfig.access - Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} newConfig.attributes - Names of the unpaywall attributes
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} newConfig.allowed - Indicates if the key is authorized or not.
 *
 * @returns {Promise<Object>} Config of apikey.
 */
async function updateApiKey(id, newConfig) {
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
    logger.error(`[redis] Cannot update apikey [${id}] for [${name}]`, err);
    throw err;
  }

  return config;
}

/**
 * Delete an apikey on redis according to its key.
 *
 * @param {string} id - key of apikey.
 *
 * @returns {Promise<void>}
 */
async function deleteApiKey(id) {
  await redisClient.del(id, redis.print);
}

module.exports = {
  createApiKey,
  updateApiKey,
  deleteApiKey,
};
