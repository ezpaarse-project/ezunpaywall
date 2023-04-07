const router = require('express').Router();

const openapi = require('../../openapi.json');

/**
 * Route that give the openapi.json file.
 */
router.get('/openapi.json', (req, res) => res.status(200).json(openapi));

module.exports = router;
