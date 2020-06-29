const graphql = require('graphql');

const { UnpaywallMutations, UnpaywallQueries } = require('./unpaywall');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    ...UnpaywallQueries,
  }),
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    ...UnpaywallMutations,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
