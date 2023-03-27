const router = require('express').Router();

const checkAuth = require('../middlewares/auth');

/**
 * Route that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response. with success HTTP code.
 */
router.post('/login', checkAuth, async (req, res) => res.status(204).json());

module.exports = router;
