const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
} = graphql;

module.exports = new GraphQLObjectType({
  name: 'UnPayWall',
  fields: () => {
    // eslint-disable-next-line global-require
    const oa_location = require('../oa_location/type');
    // eslint-disable-next-line global-require
    const z_authors = require('../z_authors/type');
    return {
      best_oa_location: { type: oa_location },
      first_oa_location: { type: oa_location },
      data_standard: { type: GraphQLInt },
      doi: { type: GraphQLID },
      doi_url: { type: GraphQLString },
      genre: { type: GraphQLString },
      is_paratext: { type: GraphQLBoolean },
      has_repository_copy: { type: GraphQLBoolean },
      is_oa: { type: GraphQLBoolean },
      journal_is_in_doaj: { type: GraphQLBoolean },
      journal_is_oa: { type: GraphQLBoolean },
      journal_issns: { type: GraphQLString },
      journal_issn_l: { type: GraphQLString },
      journal_name: { type: GraphQLString },
      oa_locations: { type: new GraphQLList(oa_location) },
      oa_status: { type: GraphQLString },
      published_date: { type: GraphQLString },
      publisher: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      year: { type: GraphQLString },
      z_authors: { type: new GraphQLList(z_authors) },
    };
  },
});
