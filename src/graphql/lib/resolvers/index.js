const unpaywall = require('./unpaywall');
const unpaywall2 = require('./unpaywall2');
const GetByDOI = require('./getByDOI');
const metrics = require('./metrics');

const resolvers = {
  Query: {
    unpaywall,
    unpaywall2,
    GetByDOI,
    metrics,
  },
};

module.exports = resolvers;
