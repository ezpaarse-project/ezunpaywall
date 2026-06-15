const router = require('express').Router();

const elastic = require('../lib/elastic');
const checkAdmin = require('../middlewares/admin');

/**
 * Route that get alias on elastic.
 *
 * Auth required.
 */
router.get('/elastic/aliases', checkAdmin, async (req, res, next) => {
  let alias;
  try {
    alias = await elastic.getAlias();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(alias);
});

/**
 * Route that get indices on elastic.
 *
 * Auth required.
 */
router.get('/elastic/indices', checkAdmin, async (req, res, next) => {
  let indices;
  try {
    indices = await elastic.getIndices();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(indices);
});

/**
 * Route that delete index on elastic.
 *
 * Auth required.
 */
router.delete('/elastic/indices/:indexName', checkAdmin, async (req, res, next) => {
  const { indexName } = req.params;
  let alias;
  try {
    alias = await elastic.removeIndex(indexName);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json(alias);
});

module.exports = router;
