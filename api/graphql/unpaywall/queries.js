const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../lib/client');

const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLBoolean,
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
      published_date_lte: { type: GraphQLString },
      published_date_gte: { type: GraphQLString },
    },
    // attr info give informations about graphql request
    resolve: async (parent, args) => {
      if (args.published_date) {
        if (args.published_date_lte || args.published_date_gte) {
          console.log('impossible to request with published_date and published_date_lte or published_date_gte');
          return null;
        }
      }
      const matchRange = /(lte|gte)/i;
      const matchlte = /(lte)/i;
      const matchgte = /(gte)/i;
      const filter = [{ terms: { doi: args.dois } }];
      const tab = [];

      console.log(args);

      /* eslint-disable no-restricted-syntax */
      /* eslint-disable guard-for-in */
      for (const attr in args) {
        // if not attr lte or gte
        if (!matchRange.exec(attr)) {
          if (args.attr !== undefined) {
            filter.push({ term: { attr: args.attr } });
          }
        }
        let val;
        // if attr lte or gte
        if (matchlte.exec(attr)) {
          [val] = attr.split('_lte');
          console.log(args[`${attr}`]);
          val.lte = 'nique ta mere';
          console.log(val);
          console.log(val.lte);
          tab.push(val);
        }
        if (matchgte.exec(attr)) {
          [val] = attr.split('_gte');
          val.gte = args.attr;
          console.log(val);
          tab.push(val);
        }
      }

      const query = {
        bool: {
          filter,
        },
      };

      let res;
      try {
        res = await client.search({
          index: 'unpaywall',
          size: args.dois.length || 1000,
          body: {
            query: {
              bool: {
                filter,
              },
            },
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
