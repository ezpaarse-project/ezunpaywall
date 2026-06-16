const router = require('express').Router();
const config = require('config');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const joi = require('joi');

const checkApiKey = require('../middlewares/user');
const upload = require('../middlewares/multer');

const { uploadDir, enrichedDir } = config.paths.data;

/**
 * Route that get list of enriched filename.
 * Auth required.
 */
router.get('/enriched', checkApiKey, async (req, res, next) => {
  const apikey = req.get('x-api-key');

  let files;
  try {
    files = await fsp.readdir(path.resolve(enrichedDir, apikey));
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
 */
router.get('/upload', checkApiKey, async (req, res, next) => {
  const apikey = req.get('x-api-key');
  let files;
  try {
    files = await fsp.readdir(path.resolve(uploadDir, apikey));
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
 * This route need a param which corresponds to filename.
 */
router.get('/enriched/:filename', checkApiKey, async (req, res, next) => {
  const { filename } = req.params;

  const { error } = joi.string().trim().required().validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  if (!await fs.existsSync(path.resolve(enrichedDir, apikey, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  return res.sendFile(path.resolve(enrichedDir, apikey, filename));
});

/**
 * Route that upload file.
 * Auth required.
 *
 * This route need a body that contains the file to upload
 */
router.post('/upload', checkApiKey, upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ message: 'File not sent' });
  const { filename } = req.file;
  return res.status(200).json(path.parse(filename).name);
});

module.exports = router;