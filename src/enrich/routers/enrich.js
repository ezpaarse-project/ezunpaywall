const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const uuid = require('uuid');
const joi = require('joi');

const checkAuth = require('../middlewares/auth');

const uploadDir = path.resolve(__dirname, '..', 'data', 'upload');
const enrichedDir = path.resolve(__dirname, '..', 'data', 'enriched');

const storage = multer.diskStorage(
  {
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
    },
  },
);

const upload = multer({ storage });

router.get('/enriched', checkAuth, async (req, res) => {
  const files = await fs.readdir(enrichedDir);
  res.status(200).json(files);
});

router.get('/uploaded', checkAuth, async (req, res) => {
  const files = await fs.readdir(uploadDir);
  res.status(200).json(files);
});

router.get('/enriched/:filename', checkAuth, async (req, res, next) => {
  const { filename } = req.params;
  const { error } = joi.string().trim().required().validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!await fs.pathExists(path.resolve(enrichedDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  return res.sendFile(path.resolve(enrichedDir, filename));
});

router.post('/upload', checkAuth, upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ message: 'File not sent' });
  const { filename } = req?.file;
  return res.status(200).json({ id: path.parse(filename).name });
});

module.exports = router;
