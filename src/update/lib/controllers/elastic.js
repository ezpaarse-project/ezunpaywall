const elastic = require('../services/elastic');
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
    await elastic.initAlias('unpaywall', unpaywallMapping, 'upw');
  } catch (err) {
    return next(err);
  }

  return res.status(202).end();
}

/**
 * Controller to get indices on elastic.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getIndices(req, res, next) {
  let indices;
  try {
    indices = await elastic.getIndices();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(indices);
}

/**
 * Controller to get alias on elastic.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getAlias(req, res, next) {
  let alias;
  try {
    alias = await elastic.getAlias();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(alias);
}

module.exports = {
  createAlias,
  getIndices,
  getAlias,
};
