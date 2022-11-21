const graphql = require('graphql');

const GetByDOI = require('./resolvers/getByDOI');
const Metrics = require('./resolvers/metrics');
const dailyMetrics = require('./resolvers/dailyMetrics');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'graphql',
  fields: () => ({
    GetByDOI,
    Metrics,
    dailyMetrics,
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = schema;
