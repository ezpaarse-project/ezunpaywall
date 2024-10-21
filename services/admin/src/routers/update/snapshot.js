const router = require('express').Router();

const upload = require('../../middlewares/uploadSnapshot');
const checkAdmin = require('../../middlewares/admin');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');

const { getSnapshotsController, uploadSnapshotController, deleteSnapshotController } = require('../../controllers/update/snapshot');

/**
 * Route that give the list of snapshots installed on ezunpaywall or the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/snapshots', checkAdmin, validateLatest, getSnapshotsController);

/**
 * Route that upload a snapshot on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/snapshots', dev, checkAdmin, upload.single('file'), uploadSnapshotController);

/**
 * Route that delete a snapshot on ezunpaywall.
 * Auth required.
 */
router.delete('/snapshots/:filename', dev, checkAdmin, validateFilename, deleteSnapshotController);

module.exports = router;
