const router = require('express').Router();
const path = require('path');

/**
 * Route that give the openapi.yml file.
 */
router.get('/openapi.yml', (req, res) => res.sendFile(path.resolve(__dirname, '..', '..', 'openapi.yml')));

module.exports = router;
