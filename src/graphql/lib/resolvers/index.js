const unpaywall = require('./unpaywall');
const GetByDOI = require('./getByDOI');
const metrics = require('./metrics');

const resolvers = {
  Query: {
    unpaywall,
    GetByDOI,
    metrics,
  },
};

module.exports = resolvers;
