const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLString,
} = graphql;

module.exports = new GraphQLObjectType({
  name: 'z_author',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});
