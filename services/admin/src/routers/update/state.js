const router = require('express').Router();

const getCurrentStateController = require('../../controllers/update/state');

/**
 * Route that give the most recent state in JSON format.
 */
router.get('/states', getCurrentStateController);

module.exports = router;
