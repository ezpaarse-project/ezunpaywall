const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../lib/client');
const oaLocationInput = require('../oa_location/inputType');
const zAuthorsInput = require('../z_authors/inputType');

const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} = graphql;

module.exports = {
  getDataUPW: {
    type: new GraphQLList(UnPayWallType),
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
        type: zAuthorsInput,
      },
    },
    // attr info give informations about graphql request
    resolve: async (parent, args) => {
      const filter = [{ terms: { doi: args.dois } }];
      const matchRange = /(range)/i;

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable guard-for-in */
      for (const attr in args) {
        if (matchRange.exec(attr)) {
          const newAttr = attr.substring(0, attr.length - 6);
          const gte = (args[attr])?.gte;
          const lte = (args[attr])?.lte;
          let range = {
            gte,
            lte,
          };
          range = `{"range": {"${newAttr}": ${JSON.stringify(range)}}}`;

          filter.push(JSON.parse(range));
        } else {
          if (attr !== 'dois' && attr !== 'best_oa_location' && attr !== 'oa_location' && attr !== 'first_oa_location') {
            filter.push(JSON.parse(`{ "terms": { "${attr}": [${args[attr]}] } }`));
          }
          // TODO factoring this
          if (attr === 'best_oa_location') {
            const attrParsed = JSON.parse(JSON.stringify(args.best_oa_location));
            let val;
            for (const attr2 in attrParsed) {
              val = `{ "terms": { "${attr}.${attr2}": ["${attrParsed[attr2]}"] } }`;
            }
            filter.push(JSON.parse(val));
          }
          if (attr === 'oa_location') {
            const attrParsed = JSON.parse(JSON.stringify(args.oa_location));
            let val;
            for (const attr2 in attrParsed) {
              val = `{ "terms": { "${attr}.${attr2}": ["${attrParsed[attr2]}"] } }`;
            }
            filter.push(JSON.parse(val));
          }
          if (attr === 'first_oa_location') {
            const attrParsed = JSON.parse(JSON.stringify(args.first_oa_location));
            let val;
            for (const attr2 in attrParsed) {
              val = `{ "terms": { "${attr}.${attr2}": ["${attrParsed[attr2]}"] } }`;
            }
            filter.push(JSON.parse(val));
          }
        }
      }

      const query = {
        bool: {
          filter,
        },
      };

      console.log(query);

      let res;
      try {
        res = await client.search({
          index: 'unpaywall',
          size: args.dois.length || 1000,
          body: {
            query,
          },
        });
        console.log(res.body.hits);
      } catch (err) {
        console.log(err.meta.body.error);
        return null;
      }
      return res.body.hits.hits.map((hit) => hit._source);
    },
  },
};
