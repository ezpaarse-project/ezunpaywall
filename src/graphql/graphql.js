const graphql = require('graphql');

const GetByDOI = require('./resolvers/getByDOI');
const Metrics = require('./resolvers/metrics');

const {
  GraphQLSchema,
  GraphQLObjectType,
} = graphql;

const RootQuery = new GraphQLObjectType({
  name: 'graphql',
  fields: () => ({
    GetByDOI,
    Metrics,
  }),
});

const schema = new GraphQLSchema({
  query: RootQuery,
});

module.exports = schema;
