const router = require('express').Router();

const {
  getEnrichedFiles,
  getUploadedFile,
  getEnrichedFileByFilename,
  uploadFile,
} = require('../controllers/file');

const checkApiKey = require('../middlewares/user');
const upload = require('../middlewares/multer');

/**
 * Route that get list of enriched filename.
 * Auth required.
 */
router.get('/enriched', checkApiKey, getEnrichedFiles);

/**
 * Route that get list of uploaded filename.
 * Auth required.
 */
router.get('/upload', checkApiKey, getUploadedFile);

/**
 * Route that get enriched file.
 * Auth required.
 *
 * This route need a param which corresponds to filename.
 */
router.get('/enriched/:filename', checkApiKey, getEnrichedFileByFilename);

/**
 * Route that upload file.
 * Auth required.
 *
 * This route need a body that contains the file to upload
 */
router.post('/upload', checkApiKey, upload.single('file'), uploadFile);

module.exports = router;
