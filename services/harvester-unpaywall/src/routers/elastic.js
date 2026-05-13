const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');
const {
  createAliasController,
  getIndicesController,
  getAliasController,
  deleteIndexController,
} = require('../controllers/elastic');

/**
 * Route that init unpaywall elastic alias with local mapping.
 *
 * Auth required.
 */
router.post('/elastic/alias', checkAdmin, createAliasController);

/**
 * Route that get alias on elastic.
 *
 * Auth required.
 */
router.get('/elastic/aliases', checkAdmin, getAliasController);

/**
 * Route that get indices on elastic.
 *
 * Auth required.
 */
router.get('/elastic/indices', checkAdmin, getIndicesController);

/**
 * Route that get alias on elastic.
 *
 * Auth required.
 */
router.delete('/elastic/indices/:indexName', checkAdmin, deleteIndexController);

module.exports = router;
