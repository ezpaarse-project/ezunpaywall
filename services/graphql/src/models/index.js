const Unpaywall = require('./unpaywall');
const UnpaywallHistory = require('./unpaywallHistory');
const OALocation = require('./oalocation');
const Author = require('./author');
const metrics = require('./metrics');

const typeDefs = `#graphql
  ${Unpaywall}
  ${UnpaywallHistory}
  ${OALocation}
  ${Author}
  ${metrics}

  type Query {
    unpaywall(dois: [ID!]!): [Unpaywall]
    unpaywallHistory(dois: [ID!]!, date: String): [UnpaywallHistory]
    GetByDOI(dois: [ID!]!): [Unpaywall]
    metrics: MetricsType
    dailyMetrics: MetricsType
  }
`;

module.exports = typeDefs;
