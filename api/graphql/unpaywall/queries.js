const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../lib/client');
const oa_location_input = require('../oa_location/inputType');

const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLInputObjectType,
} = graphql;

module.exports = {
  getDatasUPW: {
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
      year: { type: GraphQLString },
      published_date: { type: GraphQLString },
      published_date_range: {
        type: new GraphQLInputObjectType({
          name: 'published_date_range',
          fields: () => ({
            lte: { type: GraphQLString },
            gte: { type: GraphQLString },
          }),
        }),
      },
      oa_location: {
        type: oa_location_input,
      },
      best_oa_location: {
        type: oa_location_input,
      },
    },
    // attr info give informations about graphql request
    resolve: async (parent, args) => {
      const filter = [{ terms: { doi: args.dois } }];
      const matchRange = /(range)/i;

      const argsPARSE = JSON.parse(JSON.stringify(args, null, 2));

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable guard-for-in */
      for (const attr in args) {
        // if not attr lte or gte
        if (!matchRange.exec(attr)) {
          if (args.attr !== undefined) {
            filter.push({ term: { attr: args.attr } });
          }
          if (attr === 'best_oa_location') {
            const test = JSON.parse(JSON.stringify(argsPARSE.best_oa_location));
            let val;
            for (const attr2 in test) {
              console.log(attr2);
              val = `{ "terms": { "${attr}.${attr2}": ["${test[attr2]}"] } }`;
            }
            filter.push(JSON.parse(val));
          }
        // range attr
        } else {
          const newAttr = attr.substring(0, attr.length - 6);
          const gte = (args[attr])?.gte;
          const lte = (args[attr])?.lte;
          const dist = {
            gte,
            lte,
          };
          const range = `{"range": {"${newAttr}": ${JSON.stringify(dist)}}}`;

          filter.push(JSON.parse(range));
        }
      }

      const query = {
        bool: {
          filter,
        },
      };

      console.log(JSON.stringify(query, null, 2));

      let res;
      try {
        res = await client.search({
          index: 'unpaywall',
          size: args.dois.length || 1000,
          body: {
            query,
          },
        });
      } catch (err) {
        console.log(err.meta.body.error);
        return null;
      }
      return res.body.hits.hits.map((hit) => hit._source);
    },
  },
};
