const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');
const rateLimiter = require('../middlewares/rateLimit');

/**
 * Route that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 */
router.post('/login', checkAdmin, rateLimiter, async (req, res) => res.status(204).json());

module.exports = router;
