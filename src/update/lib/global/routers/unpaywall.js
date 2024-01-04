const router = require('express').Router();

const validateIntervale = require('../../middlewares/interval');
const getChangefilesOfUnpaywall = require('../controllers/unpaywall');

/**
 * Route that give the changefiles registry from unpaywall without apikey.
 *
 * This route can take a body which corresponds to the intervale of changefile.
 */
router.get('/unpaywall/changefiles', validateIntervale, getChangefilesOfUnpaywall);

module.exports = router;
