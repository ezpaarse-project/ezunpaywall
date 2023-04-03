const router = require('express').Router();

/**
 * Route that give the name of service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {string} name of service.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/', (req, res) => res.status(200).json('fakeUnpaywall service'));

/**
 * Route that ping the service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/ping', (req, res) => res.status(204).end());

module.exports = router;
