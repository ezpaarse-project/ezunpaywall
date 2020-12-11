const graphql = require('graphql');
const { UnPayWallType } = require('./index');
const client = require('../../lib/client');
const oa_location = require('../oa_location/type');
const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLObjectType,
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
      published_date: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      year: { type: GraphQLString },
    },
    // attr info give informations about graphql request
    resolve: async (parent, args, context, info) => {
      let res;
      const filter = [{ terms: { doi: args.dois, } }];
      
      for (const attr in args) {
        if (args.attr !== undefined) {
          filter.push({ term: { attr: args.attr, } });
        }
      }

      try {
        res = await client.search({
          index: 'unpaywall',
          size: args.dois.length || 1000,
          body: {
            query: {
              bool: {
                filter: filter
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
