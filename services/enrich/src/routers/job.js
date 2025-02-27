const router = require('express').Router();

const validateJobConfig = require('../middlewares/job');
const checkApiKey = require('../middlewares/user');
const checkArgs = require('../middlewares/args');

const job = require('../controllers/job');

/**
 * Route that start a enrich job.
 *
 * This route need a body that contains a config of job
 * and a param filename which corresponds to the upload filename
 */
router.post('/job/:filename', checkApiKey, checkArgs, validateJobConfig, job);

module.exports = router;
