const unpaywallType = require('./unpaywall');
const oaLocationType = require('./oalocation');
const zauthorsType = require('./zauthors');
const metrics = require('./metrics');

const typeDefs = `#graphql
  ${unpaywallType}
  ${oaLocationType}
  ${zauthorsType}
  ${metrics}

  type Query {
    unpaywall(dois: [ID!]!): [UnpaywallType]
    GetByDOI(dois: [ID!]!): [UnpaywallType]
    metrics: MetricsType
    dailyMetrics: MetricsType
  }
`;

module.exports = typeDefs;
