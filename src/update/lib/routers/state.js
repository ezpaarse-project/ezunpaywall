const router = require('express').Router();

const getCurrentState = require('../controllers/state');

/**
 * Route that give the most recent state in JSON format.
 */
router.get('/states', getCurrentState);

module.exports = router;
