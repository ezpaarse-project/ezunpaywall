const router = require('express').Router();

const checkAuth = require('../../middlewares/auth');
const createAlias = require('../controllers/elastic');

/**
 * Route that init unpaywall elastic alias with local mapping.
 *
 * Auth required.
 */
router.post('/elastic/alias', checkAuth, createAlias);

module.exports = router;
