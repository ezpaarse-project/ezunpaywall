const { initAlias } = require('../services/elastic');
const unpaywallMapping = require('../../mapping/unpaywall.json');

/**
 * Controller to create alias unpaywall on elastic.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function createAlias(req, res, next) {
  try {
    await initAlias('unpaywall', unpaywallMapping, 'upw');
  } catch (err) {
    return next(err);
  }

  return res.status(202).end();
}

module.exports = createAlias;
