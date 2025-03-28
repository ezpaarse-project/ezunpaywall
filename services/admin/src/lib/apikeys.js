const crypto = require('crypto');
const { format } = require('date-fns');

const { getClient } = require('./redis/client');
const appLogger = require('./logger/appLogger');

/**
 * Get config of apikey
 * @param {string} apikey Apikey.
 *
 * @returns {Object} Apikey config.
 */
async function get(apikey) {
  const redisClient = getClient();
  const apikeyConfig = await redisClient.get(apikey);
  return JSON.parse(apikeyConfig);
}

/**
 * Get config of apikey
 * @param {string} apikey Apikey.
 *
 * @returns {Object} Apikey config.
 */
async function checkIfExist(apikey) {
  const redisClient = getClient();
  return !!await redisClient.get(apikey);
}

/**
 * Create an apikey on redis according to its configuration.
 *
 * @param {Object} config Config of apikey.
 * @param {string} config.name Name of apikey.
 * @param {Array<string>} config.access Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} config.attributes Names of the unpaywall attributes.
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} config.allowed Indicates if the key is authorized or not.
 *
 * @returns {Promise<string>} The randomly generated API key.
 */
async function create(config) {
  const redisClient = getClient();
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
    appLogger.error(`[redis]: Cannot create apikey [${id}] for [${apikeyConfig.name}]`, err);
    throw err;
  }
  return id;
}

/**
 * Update an apikey on redis according to its key and its configuration.
 *
 * @param {string} id Key of apikey.
 * @param {Object} newConfig New config of apikey.
 * @param {string} newConfig.name Name of apikey.
 * @param {Array<string>} newConfig.access Names of the services to which the key has access.
 * Only accept graphql and enrich.
 * @param {Array<string>} newConfig.attributes Names of the unpaywall attributes
 * to which the key has access. Only accept attributes from ./attributes.js.
 * @param {boolean} newConfig.allowed Indicates if the key is authorized or not.
 *
 * @returns {Promise<Object>} Config of apikey.
 */
async function update(id, newConfig) {
  const redisClient = getClient();
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
    appLogger.error(`[redis]: Cannot update apikey [${id}] for [${name}]`, err);
    throw err;
  }

  return config;
}

/**
 * Delete an apikey on redis according to its key.
 *
 * @param {string} id key of apikey.
 *
 * @returns {Promise<void>}
 */
async function remove(id) {
  const redisClient = getClient();
  try {
    await redisClient.del(id);
  } catch (err) {
    appLogger.error(`[redis]: Cannot delete apikey [${id}]`, err);
    return false;
  }
  return true;
}

module.exports = {
  get,
  checkIfExist,
  create,
  update,
  remove,
};
