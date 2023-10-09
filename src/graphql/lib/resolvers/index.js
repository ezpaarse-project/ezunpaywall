const unpaywall = require('./unpaywall');
const GetByDOI = require('./getByDOI');
const metrics = require('./metrics');
const dailyMetrics = require('./dailyMetrics');

const resolvers = {
  Query: {
    unpaywall,
    GetByDOI,
    metrics,
    dailyMetrics,
  },
};

module.exports = resolvers;
