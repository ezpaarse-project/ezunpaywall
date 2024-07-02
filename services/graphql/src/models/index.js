const unpaywall = require('./unpaywall');
const unpaywallHistory = require('./unpaywallHistory');
const oaLocation = require('./oalocation');
const zauthors = require('./zauthors');
const metrics = require('./metrics');

const typeDefs = `#graphql
  ${unpaywall}
  ${unpaywallHistory}
  ${oaLocation}
  ${zauthors}
  ${metrics}

  type Query {
    unpaywall(dois: [ID!]!): [UnpaywallType]
    unpaywallHistory(dois: [ID!]!, date: String): [unpaywallHistoryType]
    GetByDOI(dois: [ID!]!): [UnpaywallType]
    metrics: MetricsType
    dailyMetrics: MetricsType
  }
`;

module.exports = typeDefs;
