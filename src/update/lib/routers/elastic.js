const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const { createAlias, getIndices, getAlias } = require('../controllers/elastic');

/**
 * Route that init unpaywall elastic alias with local mapping.
 *
 * Auth required.
 */
router.post('/elastic/alias', checkAuth, createAlias);

/**
 * Route that get indices on elastic.
 *
 * Auth required.
 */
router.get('/elastic/indices', checkAuth, getIndices);

/**
 * Route that get alias on elastic.
 *
 * Auth required.
 */
router.get('/elastic/aliases', checkAuth, getAlias);

module.exports = router;
