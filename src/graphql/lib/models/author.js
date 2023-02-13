const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
} = graphql;

const authorType = new GraphQLObjectType({
  name: 'authorType',
  fields: {
    ORCID: { type: GraphQLString },
    family: { type: GraphQLString },
    given: { type: GraphQLString },
  },
});

const authorInput = new GraphQLInputObjectType({
  name: 'authorInput',
  fields: {
    ORCID: { type: GraphQLString },
    family: { type: GraphQLString },
    given: { type: GraphQLString },
  },
});

module.exports = {
  authorType,
  authorInput,
};
