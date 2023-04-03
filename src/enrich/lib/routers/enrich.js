const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const joi = require('joi');

const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');
const enrichedDir = path.resolve(__dirname, '..', '..', 'data', 'enriched');

const checkAuth = require('../middlewares/auth');
const upload = require('../middlewares/multer');

/**
 * Route that get list of enriched filename.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Object} List of enriched filename.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/enriched', checkAuth, async (req, res) => {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fs.readdir(path.resolve(enrichedDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
});

/**
 * Route that get list of uploaded filename.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Object} list of uploaded filename
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/upload', checkAuth, async (req, res) => {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fs.readdir(path.resolve(uploadDir, apikey));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      return res.status(500).end();
    }
    files = [];
  }
  return res.status(200).json(files);
});

/**
 * Route that get enriched file.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeParams {string} Enriched filename.
 *
 * @routeResponse {Object} Enriched file.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/enriched/:filename', checkAuth, async (req, res) => {
  const { filename } = req.params;

  const { error } = joi.string().trim().required().validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  if (!await fs.pathExists(path.resolve(enrichedDir, apikey, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  return res.sendFile(path.resolve(enrichedDir, apikey, filename));
});

/**
 * Route that upload file.
 * Auth required.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeResponse {Object} Filename of uploaded file.
 *
 * @return {import('express').Response} HTTP response.
 */
router.post('/upload', checkAuth, upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ message: 'File not sent' });
  const { filename } = req?.file;
  return res.status(200).json(path.parse(filename).name);
});

module.exports = router;
