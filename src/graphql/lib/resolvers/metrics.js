const { getMetrics } = require('../services/elastic');

const metrics = async (parent, args, req) => {
  const index = req?.get('index');
  const res = await getMetrics(index);
  return res;
};

module.exports = metrics;
