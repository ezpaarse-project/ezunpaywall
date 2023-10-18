const unpaywallType = require('./unpaywall');
const unpaywallType2 = require('./unpaywall2');
const oaLocationType = require('./oalocation');
const zauthorsType = require('./zauthors');
const metrics = require('./metrics');

const typeDefs = `#graphql
  ${unpaywallType}
  ${unpaywallType2}
  ${oaLocationType}
  ${zauthorsType}
  ${metrics}

  type Query {
    unpaywall(dois: [ID!]!): [UnpaywallType]
    unpaywall2(dois: [ID!]!, date: String): [UnpaywallType2]
    GetByDOI(dois: [ID!]!): [UnpaywallType]
    metrics: MetricsType
    dailyMetrics: MetricsType
  }
`;

module.exports = typeDefs;
