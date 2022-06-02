const router = require('express').Router();

const openapi = require('../openapi.json');

router.get('/openapi.json', async (req, res) => res.status(200).json(openapi));

module.exports = router;
