const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
} = graphql;

const authorType = new GraphQLObjectType({
  name: 'authorType',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});

const authorInput = new GraphQLInputObjectType({
  name: 'authorInput',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});

module.exports = {
  authorType,
  authorInput,
};
