const graphql = require('graphql');

const {
  GraphQLObjectType,
  GraphQLInt,
} = graphql;

const metricsType = new GraphQLObjectType({
  name: 'metricsType',
  fields: {
    doi: { type: GraphQLInt },
    isOA: { type: GraphQLInt },
    goldOA: { type: GraphQLInt },
    hybridOA: { type: GraphQLInt },
    bronzeOA: { type: GraphQLInt },
    greenOA: { type: GraphQLInt },
    closedOA: { type: GraphQLInt },
  },
});

module.exports = metricsType;
