const router = require('express').Router();

const healthCheckLogger = require('../logger/healthcheck');

/**
 * Route use for healthcheck.
 */
router.get('/healthcheck', healthCheckLogger, (req, res, next) => res.status(204).end());

module.exports = router;
