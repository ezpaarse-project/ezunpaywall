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
      
      if (args.data_standard) {
        filter.push({ term: { data_standard: args.data_standard, } });
      }
      if (args.doi_url) {
        filter.push({ term: { doi_url: args.doi_url, } });
      }
      if (args.genre) {
        filter.push({ term: { genre: args.genre, } });
      }
      // FIXME dosent work
      if (args.has_repository_copy) {
        filter.push({ term: { has_repository_copy: args.has_repository_copy, } });
      }
      // FIXME dosent work
      if (args.is_oa) {
        filter.push({ term: { is_oa: args.is_oa, } });
      }
      if (args.is_paratext) {
        filter.push({ term: { is_paratext: args.is_paratext, } });
      }
      if (args.journal_is_in_doaj) {
        filter.push({ term: { journal_is_in_doaj: args.journal_is_in_doaj, } });
      }
      if (args.journal_is_oa) {
        filter.push({ term: { journal_is_oa: args.journal_is_oa, } });
      }
      if (args.journal_issn_l) {
        filter.push({ term: { journal_issn_l: args.journal_issn_l, } });
      }
      if (args.journal_name) {
        filter.push({ term: { journal_name: args.journal_name, } });
      }
      if (args.oa_status) {
        filter.push({ term: { oa_status: args.oa_status, } });
      }
      if (args.published_date) {
        filter.push({ term: { published_date: args.published_date, } });
      }
      if (args.title) {
        filter.push({ term: { title: args.title, } });
      }
      if (args.updated) {
        filter.push({ term: { updated: args.updated, } });
      }
      if (args.year) {
        filter.push({ term: { year: args.year, } });
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
