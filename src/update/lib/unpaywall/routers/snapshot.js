const router = require('express').Router();

const upload = require('../../middlewares/multer');
const checkAuth = require('../../middlewares/auth');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/latest');
const validateFilename = require('../../middlewares/filename');

const {
  getFiles,
  uploadFile,
  deleteInstalledFile,
} = require('../controllers/file');

/**
 * Route that give the list of snapshots installed on ezunpaywall of the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/snapshots', checkAuth, validateLatest, getFiles);

/**
 * Route that upload a file on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/snapshots', dev, checkAuth, upload.single('file'), uploadFile);

/**
 * Route that delete a file on ezunpaywall.
 * Auth required.
 */
router.delete('/snapshots/:filename', dev, checkAuth, validateFilename, deleteInstalledFile);

module.exports = router;
