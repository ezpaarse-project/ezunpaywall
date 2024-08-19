const router = require('express').Router();

const upload = require('../../middlewares/uploadChangefile');
const checkAuth = require('../../middlewares/auth');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');

const { getChangefiles, uploadChangefile, deleteChangefile } = require('../../controllers/update/changefile');

/**
 * Route that give the list of changefiles installed on ezunpaywall or the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/changefiles', checkAuth, validateLatest, getChangefiles);

/**
 * Route that upload a changefile on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/changefiles', dev, checkAuth, upload.single('file'), uploadChangefile);

/**
 * Route that delete a changefile on ezunpaywall.
 * Auth required.
 */
router.delete('/changefiles/:filename', dev, checkAuth, validateFilename, deleteChangefile);

module.exports = router;
