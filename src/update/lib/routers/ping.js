const router = require('express').Router();

const {
  health,
  healthElastic,
} = require('../controllers/health');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('update service'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res, next) => res.status(204).end());

/**
 * route that gives the state of health of the service.
 */
router.get('/health', health);

/**
 * Route that gives the state of health of elastic.
 */
router.get('/health/elastic', healthElastic);

module.exports = router;
