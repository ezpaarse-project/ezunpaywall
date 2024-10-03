const { elasticsearch } = require('config');

const { getMetrics } = require('../lib/elastic');

const metrics = async (parent, args, req) => {
  let index = req?.get('index');

  if (!index) {
    index = elasticsearch.indexBase;
  }

  const res = await getMetrics(index);
  return res;
};

module.exports = metrics;
