const router = require('express').Router();

const {
  health,
  healthRedis,
  healthElastic,
} = require('../controllers/health');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('ezUNPAYWALL admin API'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * route that gives the state of health of the service.
 */
router.get('/health', health);

/**
 * Route that gives the state of health of redis.
 */
router.get('/health/redis', healthRedis);

/**
 * Route that gives the state of health of elastic.
 */
router.get('/health/elastic', healthElastic);

module.exports = router;
