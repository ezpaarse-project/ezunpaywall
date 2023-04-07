const router = require('express').Router();

const checkAuth = require('../middlewares/auth');

/**
 * Route that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 */
router.post('/login', checkAuth, async (req, res) => res.status(204).json());

module.exports = router;
