const router = require('express').Router();

const upload = require('../../middlewares/uploadSnapshot');
const checkAuth = require('../../middlewares/auth');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');

const { getSnapshots, uploadSnapshot, deleteSnapshot } = require('../../controllers/update/snapshot');

/**
 * Route that give the list of snapshots installed on ezunpaywall or the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/snapshots', checkAuth, validateLatest, getSnapshots);

/**
 * Route that upload a snapshot on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/snapshots', dev, checkAuth, upload.single('file'), uploadSnapshot);

/**
 * Route that delete a snapshot on ezunpaywall.
 * Auth required.
 */
router.delete('/snapshots/:filename', dev, checkAuth, validateFilename, deleteSnapshot);

module.exports = router;
