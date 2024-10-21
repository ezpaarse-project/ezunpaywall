const elastic = require('../lib/elastic');
const unpaywallMapping = require('../../mapping/unpaywall.json');

/**
 * Controller to create alias unpaywall on elastic.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function createAliasController(req, res, next) {
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
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getIndicesController(req, res, next) {
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
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function getAliasController(req, res, next) {
  let alias;
  try {
    alias = await elastic.getAlias();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(alias);
}

/**
 * Controller to delete index on elastic.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function deleteIndexController(req, res, next) {
  const { indexName } = req.params;
  let alias;
  try {
    alias = await elastic.removeIndex(indexName);
  } catch (err) {
    console.log(err);
    return next(err);
  }

  return res.status(200).json(alias);
}

module.exports = {
  createAliasController,
  getIndicesController,
  getAliasController,
  deleteIndexController,
};
