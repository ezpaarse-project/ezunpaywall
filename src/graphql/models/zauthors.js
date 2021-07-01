const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLString,
} = graphql;

const inputZAuthor = new GraphQLInputObjectType({
  name: 'input_z_author',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});

const zAuthors = new GraphQLObjectType({
  name: 'z_author',
  fields: {
    family: { type: GraphQLString },
    given: { type: GraphQLString },
    sequence: { type: GraphQLString },
  },
});

module.exports = {
  inputZAuthor,
  zAuthors
};
