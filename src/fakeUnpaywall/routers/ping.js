const router = require('express').Router();

router.get('/', (req, res) => res.status(200).json('fakeUnpaywall service'));

router.get('/ping', (req, res, next) => res.status(204).end());

module.exports = router;
