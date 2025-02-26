const router = require('express').Router();

const statusController = require('../controllers/status');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('ezUNPAYWALL admin API'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * route that gives the status of each services connected to admin service.
 */
router.get('/status', statusController);

module.exports = router;
