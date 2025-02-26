const router = require('express').Router();

const statusController = require('../controllers/status');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('ezUNPAYWALL enrich API'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * Route that gives status of each service.
 */
router.get('/status', statusController);

module.exports = router;
