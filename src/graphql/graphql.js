const graphql = require('graphql');

const { UnPayWallQueries } = require('./unpaywall');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    ...UnPayWallQueries,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
