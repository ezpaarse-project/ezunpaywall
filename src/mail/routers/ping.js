const router = require('express').Router();

router.get('/', async (req, res) => res.status(200).json('mail service'));

router.get('/ping', async (req, res, next) => res.status(204));

module.exports = router;
