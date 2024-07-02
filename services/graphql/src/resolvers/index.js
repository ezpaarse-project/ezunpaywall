const unpaywall = require('./unpaywall');
const unpaywallHistory = require('./unpaywallHistory');
const metrics = require('./metrics');
const dailyMetrics = require('./dailyMetrics');

const resolvers = {
  Query: {
    unpaywall,
    unpaywallHistory,
    GetByDOI: unpaywall,
    metrics,
    dailyMetrics,
  },
};

module.exports = resolvers;
