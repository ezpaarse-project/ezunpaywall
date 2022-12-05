const router = require('express').Router();

router.get('/', async (req, res) => res.status(200).json('fakeUnpaywall service'));

router.get('/ping', async (req, res, next) => res.status(200).json());

module.exports = router;
