const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
} = graphql;

const unpaywall = new GraphQLObjectType({
  name: 'unpaywall',
  fields: () => {
    // eslint-disable-next-line global-require
    const { oaLocation } = require('./oalocation');
    // eslint-disable-next-line global-require
    const { zAuthors } = require('./zauthors');
    return {
      best_oa_location: { type: oaLocation },
      first_oa_location: { type: oaLocation },
      oa_locations: { type: new GraphQLList(oaLocation) },
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
      oa_status: { type: GraphQLString },
      published_date: { type: GraphQLString },
      publisher: { type: GraphQLString },
      title: { type: GraphQLString },
      updated: { type: GraphQLString },
      year: { type: GraphQLString },
      z_authors: { type: new GraphQLList(zAuthors) },
    };
  },
});

module.exports = {
  unpaywall
}
