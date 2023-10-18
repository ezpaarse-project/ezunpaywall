const unpaywall = require('./unpaywall');
const unpaywall2 = require('./unpaywall2');
const GetByDOI = require('./getByDOI');
const metrics = require('./metrics');
const dailyMetrics = require('./dailyMetrics');

const resolvers = {
  Query: {
    unpaywall,
    unpaywall2,
    GetByDOI,
    metrics,
    dailyMetrics,
  },
};

module.exports = resolvers;
