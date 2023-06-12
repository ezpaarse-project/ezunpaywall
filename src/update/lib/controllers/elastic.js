const { initAlias } = require('../services/elastic');
const unpaywallMapping = require('../../mapping/unpaywall.json');

async function createAlias(req, res, next) {
  try {
    await initAlias('unpaywall', unpaywallMapping, 'upw');
  } catch (err) {
    return next(err);
  }

  return res.status(202).end();
}

module.exports = createAlias;
