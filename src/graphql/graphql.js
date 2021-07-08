const graphql = require('graphql');

const GetByDOI = require('./resolvers/queries');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    GetByDOI,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
