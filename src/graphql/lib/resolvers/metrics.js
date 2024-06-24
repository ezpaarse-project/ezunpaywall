const config = require('config');

const { getMetrics } = require('../services/elastic');

const indexBase = config.get('elasticsearch.indexBase');

const metrics = async (parent, args, req) => {
  let index = req?.get('index');

  if (!index) {
    index = indexBase;
  }

  const res = await getMetrics(index);
  return res;
};

module.exports = metrics;
