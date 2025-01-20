const router = require('express').Router();

const checkApiKey = require('../middlewares/user');

const validateLatest = require('../middlewares/latest');
const validateFilename = require('../middlewares/filename');
const upsertDirectoryOfUser = require('../middlewares/state');

const { getStates, getStateByFilename } = require('../controllers/state');

/**
 * Route that give list of filename of state or the content of latest
 * state.
 *
 * This route can take in query latest.
 */
router.get('/states', checkApiKey, validateLatest, upsertDirectoryOfUser, getStates);

/**
 * Route that give the content of state.
 *
 * This route need a param which corresponds to the filename of state.
 */
router.get('/states/:filename', checkApiKey, validateFilename, upsertDirectoryOfUser, getStateByFilename);

module.exports = router;
