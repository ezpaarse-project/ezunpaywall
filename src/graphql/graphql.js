const graphql = require('graphql');

const GetByDOI = require('./resolvers/queries');
const Metrics = require('./resolvers/metrics');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: () => ({
    GetByDOI,
    Metrics,
  }),
});

module.exports = new GraphQLSchema({
  query: RootQuery,
});
