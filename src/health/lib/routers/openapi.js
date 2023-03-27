const router = require('express').Router();

const openapi = require('../../openapi.json');

/**
 * Route that give the openapi.json file.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {Object} openapi in json format.
 *
 * @returns {Object} HTTP response.
 */
router.get('/openapi.json', (req, res) => res.status(200).json(openapi));

module.exports = router;
