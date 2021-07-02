const graphql = require('graphql');

const {
  GraphQLInputObjectType,
  GraphQLString,
} = graphql;

const inputAuthor = new GraphQLInputObjectType({
  name: 'inputAuthor',
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
  inputAuthor,
  zAuthors
};
