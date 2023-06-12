const router = require('express').Router();

const {
  getEnrichedFile,
  getUploadedFile,
  getEnrichedFileByFilename,
  uploadFile,
} = require('../controllers/file');

const checkAuth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

/**
 * Route that get list of enriched filename.
 * Auth required.
 */
router.get('/enriched', checkAuth, getEnrichedFile);

/**
 * Route that get list of uploaded filename.
 * Auth required.
 */
router.get('/upload', checkAuth, getUploadedFile);

/**
 * Route that get enriched file.
 * Auth required.
 *
 * This route need a param which corresponds to filename.
 */
router.get('/enriched/:filename', checkAuth, getEnrichedFileByFilename);

/**
 * Route that upload file.
 * Auth required.
 *
 * This route need a body that contains the file to upload
 */
router.post('/upload', checkAuth, upload.single('file'), uploadFile);

module.exports = router;
