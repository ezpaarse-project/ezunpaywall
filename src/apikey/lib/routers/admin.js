const router = require('express').Router();

const checkAuth = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimit');

/**
 * Route that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 */
router.post('/login', checkAuth, rateLimiter, async (req, res) => res.status(204).json());

module.exports = router;
