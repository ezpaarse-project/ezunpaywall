const router = require('express').Router();

const {
  health,
  healthRedis,
  healthGraphql,
} = require('../controllers/health');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('enrich service'));

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
 * Route that gives the state of health of graphql.
 */
router.get('/health/graphql', healthGraphql);

module.exports = router;
