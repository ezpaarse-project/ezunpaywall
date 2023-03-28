const router = require('express').Router();

/**
 * Route that give the name of service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {String} name of service.
 *
 * @returns {Object} HTTP response.
 */
router.get('/', (req, res) => res.status(200).json('fakeUnpaywall service'));

/**
 * Route that ping the service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.get('/ping', (req, res, next) => res.status(204).end());

module.exports = router;
