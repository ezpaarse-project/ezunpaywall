const router = require('express').Router();

const upload = require('../../middlewares/uploadChangefile');
const checkAdmin = require('../../middlewares/admin');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');

const { getChangefilesController, uploadChangefileController, deleteChangefileController } = require('../../controllers/update/changefile');

/**
 * Route that give the list of changefiles installed on ezunpaywall or the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/changefiles', checkAdmin, validateLatest, getChangefilesController);

/**
 * Route that upload a changefile on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/changefiles', dev, checkAdmin, upload.single('file'), uploadChangefileController);

/**
 * Route that delete a changefile on ezunpaywall.
 * Auth required.
 */
router.delete('/changefiles/:filename', checkAdmin, validateFilename, deleteChangefileController);

module.exports = router;
