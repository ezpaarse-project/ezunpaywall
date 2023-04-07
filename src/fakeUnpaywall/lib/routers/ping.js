const router = require('express').Router();

/**
 * Route that give the name of service.

 */
router.get('/', (req, res) => res.status(200).json('fakeUnpaywall service'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

module.exports = router;
