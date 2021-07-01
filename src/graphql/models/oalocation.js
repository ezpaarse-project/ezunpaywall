const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLBoolean,
  GraphQLID,
} = graphql;

const inputOaLocation = new GraphQLInputObjectType({
  name: 'input_oa_location',
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

const oaLocation = new GraphQLObjectType({
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

module.exports = {
  inputOaLocation,
  oaLocation
};

