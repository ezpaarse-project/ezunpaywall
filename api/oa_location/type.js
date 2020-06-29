const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} = graphql;

module.exports = new GraphQLObjectType({
  name: 'oa_location',
  fields: {
    endpoint_id: { type: GraphQLID },
    evidence: { type: GraphQLString },
    host_type: { type: GraphQLString },
    is_best: { type: GraphQLBoolean },
    license: { type: GraphQLString },
    pmh_id: { type: GraphQLString },
    repository_institution: { type: GraphQLString },
    updated: { type: GraphQLString },
    url: { type: GraphQLString },
    url_for_landing_page: { type: GraphQLString },
    url_for_pdf: { type: GraphQLString },
    version: { type: GraphQLString },
  },
});
