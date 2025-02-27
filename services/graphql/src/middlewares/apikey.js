const graphqlFields = require('graphql-fields');
const logger = require('../lib/logger/appLogger');
const { getClient } = require('../lib/redis/client');

/**
 * Flatten nested properties of an object by separating keys with dots.
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 *
 * @param {Object} obj Object need to be flatten.
 *
 * @returns {Object} Flatten object.
 */
function flatten(obj) {
  const flattened = [];

  function flattenProp(data, keys) {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value !== 'object') { return; }

      const newKeys = [...keys, key];

      if (Object.keys(value).length === 0) {
        flattened.push(newKeys.join('.'));
      } else {
        flattenProp(value, newKeys);
      }
    });
  }

  flattenProp(obj, []);

  return flattened;
}

/**
 *
 * @param req Request
 * @param args Graphql args
 * @param info Info about graphql
 */
async function checkApikey(req, args, info) {
  const redisClient = getClient();
  const apikey = req.get('X-API-KEY');

  if (!apikey) {
    throw Error('Not authorized');
  }

  let key;
  try {
    key = await redisClient.get(apikey);
  } catch (err) {
    logger.error(`[redis]: Cannot get [${apikey}]`, err);
    throw Error('Internal server error');
  }

  let apiKeyConfig;
  try {
    apiKeyConfig = JSON.parse(key);
  } catch (err) {
    logger.error(`[redis]: Cannot parse [${key}]`, err);
    throw Error('Internal server error');
  }

  if (!Array.isArray(apiKeyConfig?.access) || !apiKeyConfig?.access?.includes('graphql') || !apiKeyConfig?.allowed) {
    throw Error('Not authorized');
  }

  // Demo apikey
  if (apikey === 'demo') {
    if ((apiKeyConfig.count - args.dois.length) < 0) {
      throw Error('Not authorized');
    }
    apiKeyConfig.count -= args.dois.length;
    try {
      await redisClient.set(apikey, `${JSON.stringify(apiKeyConfig)}`);
    } catch (err) {
      logger.error(`[redis]: Cannot update apikey [${apikey}] with config [${JSON.stringify(apiKeyConfig)}]`, err);
      throw err;
    }
  }

  const { attributes } = apiKeyConfig;

  if (!attributes.includes('*')) {
    const test = graphqlFields(info);
    const requestedField = flatten(test);

    requestedField.forEach((field) => {
      if (!attributes.includes(field)) {
        throw Error(`You don't have access to ${field}`);
      }
    });
  }
}

module.exports = checkApikey;
