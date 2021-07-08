const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLString,
} = graphql;

exports.authorType = new GraphQLObjectType({
  name: 'authorType',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});

exports.authorInput = new GraphQLInputObjectType({
  name: 'authorInput',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});
