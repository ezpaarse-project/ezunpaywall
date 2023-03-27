/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const graphql = require('graphql');
const graphqlFields = require('graphql-fields');

const config = require('config');

const { redisClient } = require('../services/redis');
const { elasticClient } = require('../services/elastic');

const logger = require('../logger');

const unpaywallType = require('../models/unpaywall');

const {
  GraphQLList,
  GraphQLID,
} = graphql;

/**
 * Flatten nested properties of an object by seperating keys with dots.
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 *
 * @param {Object} obj - Object need to be flatten.
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

const getByDOI = {
  type: new GraphQLList(unpaywallType),
  args: {
    dois: { type: new GraphQLList(GraphQLID) },
  },
  // attr info give informations about graphql request
  resolve: async (parent, args, req, info) => {
    const apikey = req.get('X-API-KEY');

    if (!apikey) {
      throw Error('Not authorized');
    }

    let key;
    try {
      key = await redisClient.get(apikey);
    } catch (err) {
      logger.error(`Cannot get ${apikey} on redis`);
      logger.error(err);
      throw Error('Internal server error');
    }

    let apiKeyConfig;
    try {
      apiKeyConfig = JSON.parse(key);
    } catch (err) {
      logger.error(`Cannot parse ${key}`);
      logger.error(err);
      throw Error('Internal server error');
    }

    if (!Array.isArray(apiKeyConfig?.access) || !apiKeyConfig?.access?.includes('graphql') || !apiKeyConfig?.allowed) {
      throw Error('Not authorized');
    }

    // Demo apikey
    if (apikey === 'demo') {
      if ((apiKeyConfig.count - args?.dois?.length) < 0) {
        throw Error('Not authorized');
      }
      apiKeyConfig.count -= args?.dois?.length;
      try {
        await redisClient.set(apikey, `${JSON.stringify(apiKeyConfig)}`);
      } catch (err) {
        logger.error(`Cannot update apikey [${apikey}] for [count]`);
        return Promise.reject(err);
      }
    }

    let index = req?.get('index');

    const { attributes } = req;

    if (!index) {
      index = config.get('elasticsearch.indexAlias');
    }

    if (!attributes.includes('*')) {
      const test = graphqlFields(info);
      const requestedField = flatten(test);

      requestedField.forEach((field) => {
        if (!attributes.includes(field)) {
          throw Error(`You don't have access to ${field}`);
        }
      });
    }

    const dois = [];

    req.countDOI = args?.dois?.length;

    // Normalize request
    args.dois.forEach((doi) => {
      dois.push(doi.toLowerCase());
    });

    const filter = [{ terms: { doi: dois } }];

    const query = {
      bool: {
        filter,
      },
    };

    let res;
    try {
      res = await elasticClient.search({
        index,
        size: dois.length || 1000,
        body: {
          query,
          _source: attributes,
        },

      });
    } catch (err) {
      logger.error('Cannot request elastic');
      logger.error(err);
      return null;
    }
    // eslint-disable-next-line no-underscore-dangle
    return res.body.hits.hits.map((hit) => hit._source);
  },
};

module.exports = getByDOI;
