const router = require('express').Router();

const getCurrentState = require('../../controllers/update/state');

/**
 * Route that give the most recent state in JSON format.
 */
router.get('/states', getCurrentState);

module.exports = router;
