const graphql = require('graphql');

const GetByDOI = require('./getByDOI');
const Metrics = require('./metrics');
const DailyMetrics = require('./dailyMetrics');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'graphql',
  fields: () => ({
    GetByDOI,
    Metrics,
    DailyMetrics,
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = schema;
