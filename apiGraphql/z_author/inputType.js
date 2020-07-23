const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLString,
} = graphql;

module.exports = new GraphQLInputObjectType({
  name: 'input_z_author',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});
