const router = require('express').Router();

const { health, healthRedis } = require('../controllers/ping');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('apikey service'));

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

module.exports = router;
