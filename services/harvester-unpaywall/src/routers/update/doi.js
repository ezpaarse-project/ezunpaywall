const router = require('express').Router();

const { updateDOIController, getCountDOIController, getDOICachedController } = require('../../controllers/update/doi');
const countDOI = require('../../middlewares/doi');

/**
 * Route that update one doi on ezunpaywall from unpaywall.
 */
router.post('/doi/update', countDOI, updateDOIController);

/**
 * Route to get count of doi updated in current day.
 */
router.get('/doi/update/count', getCountDOIController);

/**
 * Route to get cache of doi updated in current day.
 */
router.get('/doi/update/cache', getDOICachedController);

module.exports = router;
