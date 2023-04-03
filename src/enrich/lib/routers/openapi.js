const router = require('express').Router();

const openapi = require('../../openapi.json');

/**
 * Route that give the openapi.json file.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Object} openapi in json format.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/openapi.json', (req, res) => res.status(200).json(openapi));

module.exports = router;
