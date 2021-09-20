/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const graphql = require('graphql');
const graphqlFields = require('graphql-fields');

const config = require('config');
const unpaywallType = require('../models/unpaywall');
const { elasticClient } = require('../lib/elastic');
const { oaLocationInput } = require('../models/oalocation');
const { authorInput } = require('../models/author');
const logger = require('../lib/logger');

const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} = graphql;

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
 * convert a unpaywall deep attr into elastic readable object
 *
 * example
 * attr = best_oa_location
 * args = { dois: [ '10.1186/s40510-015-0109-6' ], best_oa_location: { license: 'cc-by' } }
 * return { terms: { 'best_oa_location.license': [ 'cc-by' ] } }
 *
 * @param {String} attr name of attribute
 * @param {Object} args graphql arguments
 * @returns {Object} elatic readable object
 */
const parseTerms = (attr, args) => {
  const subAttr = args[attr];
  const [filters] = Object.entries(subAttr).map(([key, value]) => ({ terms: { [`${attr}.${key}`]: [value] } }));
  return filters;
};

module.exports = {
  type: new GraphQLList(unpaywallType),
  args: {
    dois: { type: new GraphQLList(GraphQLID) },
    data_standard: { type: GraphQLInt },
    doi_url: { type: GraphQLString },
    genre: { type: GraphQLString },
    has_repository_copy: { type: GraphQLBoolean },
    is_oa: { type: GraphQLBoolean },
    is_paratext: { type: GraphQLBoolean },
    journal_is_in_doaj: { type: GraphQLBoolean },
    journal_is_oa: { type: GraphQLBoolean },
    journal_issn_l: { type: GraphQLString },
    journal_issns: { type: GraphQLString },
    journal_name: { type: GraphQLString },
    oa_status: { type: GraphQLString },
    title: { type: GraphQLString },
    updated: { type: GraphQLString },
    year: { type: new GraphQLList(GraphQLString) },
    published_date: { type: GraphQLString },
    oa_location: {
      type: oaLocationInput,
    },
    best_oa_location: {
      type: oaLocationInput,
    },
    first_oa_location: {
      type: oaLocationInput,
    },
    published_date_range: {
      type: new GraphQLInputObjectType({
        name: 'published_date_range',
        fields: () => ({
          lte: { type: GraphQLString },
          gte: { type: GraphQLString },
        }),
      }),
    },
    year_range: {
      type: new GraphQLInputObjectType({
        name: 'year_range',
        fields: () => ({
          lte: { type: GraphQLString },
          gte: { type: GraphQLString },
        }),
      }),
    },
    z_authors: {
      type: authorInput,
    },
  },
  // attr info give informations about graphql request
  resolve: async (parent, args, req, info) => {
    let index = req?.get('index');

    const { attributes } = req;

    if (!index) {
      index = config.get('elasticsearch.indexAlias');
    }

    if (attributes !== '*') {
      const test = graphqlFields(info);
      const requestedField = flatten(test);

      requestedField.forEach((field) => {
        if (!attributes.includes(field)) {
          throw Error(`You don't have access to ${field}`);
        }
      });
    }

    const filter = [{ terms: { doi: args.dois } }];
    const matchRange = /(range)/i;

    for (const attr in args) {
      if (matchRange.exec(attr)) {
        const newAttr = attr.substring(0, attr.length - 6);
        const gte = (args[attr])?.gte;
        const lte = (args[attr])?.lte;
        let range = {
          gte,
          lte,
        };

        range = {
          range: {
            [newAttr]: { gte, lte },
          },
        };

        filter.push(range);
      } else {
        const deepAttrs = new Set(['best_oa_location', 'oa_location', 'first_oa_location']);
        if (deepAttrs.has(attr)) {
          filter.push(parseTerms(attr, args));
        } else if (attr !== 'dois') {
          const value = args[attr];
          if (Array.isArray(value)) {
            filter.push({ terms: { [attr]: value } });
          } else {
            filter.push({ term: { [attr]: value } });
          }
        }
      }
    }

    const query = {
      bool: {
        filter,
      },
    };

    let res;
    try {
      res = await elasticClient.search({
        index,
        size: args.dois.length || 1000,
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
