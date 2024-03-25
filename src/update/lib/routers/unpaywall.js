const router = require('express').Router();

const validateInterval = require('../middlewares/format/interval');
const getChangefilesOfUnpaywall = require('../controllers/unpaywall');

/**
 * Route that give the changefiles registry from unpaywall without apikey.
 *
 * This route can take a body which corresponds to the intervale of changefile.
 */
router.get('/unpaywall/changefiles', validateInterval, getChangefilesOfUnpaywall);

module.exports = router;
