const router = require('express').Router();

const checkAuth = require('../middlewares/auth');

router.get('/login', checkAuth, async (req, res, next) => res.status(204).json());

module.exports = router;
