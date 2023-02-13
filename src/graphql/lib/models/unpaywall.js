const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLList,
  GraphQLID,
} = graphql;

const { oaLocationType } = require('./oalocation');
const { authorType } = require('./author');

const unpaywallType = new GraphQLObjectType({
  name: 'unpaywallType',
  fields: () => ({
    best_oa_location: { type: oaLocationType },
    first_oa_location: { type: oaLocationType },
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
    oa_locations: { type: new GraphQLList(oaLocationType) },
    oa_status: { type: GraphQLString },
    published_date: { type: GraphQLString },
    publisher: { type: GraphQLString },
    title: { type: GraphQLString },
    updated: { type: GraphQLString },
    year: { type: GraphQLString },
    z_authors: { type: new GraphQLList(authorType) },
  }),
});

module.exports = unpaywallType;
