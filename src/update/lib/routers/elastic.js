const router = require('express').Router();

const checkAuth = require('../middlewares/auth');

const { initAlias } = require('../services/elastic');
const unpaywallMapping = require('../../mapping/unpaywall.json');

/**
 * Route that init unpaywall elastic alias with local mapping.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.post('/elastic/alias', checkAuth, async (req, res, next) => {
  try {
    await initAlias('unpaywall', unpaywallMapping, 'upw');
  } catch (err) {
    return next(err);
  }

  return res.status(202).end();
});

module.exports = router;
