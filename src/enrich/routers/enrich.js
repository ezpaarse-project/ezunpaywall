const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const multer = require('multer');
const uuid = require('uuid');
const joi = require('joi');
const boom = require('@hapi/boom');

const uploadDir = path.resolve(__dirname, '..', 'out', 'upload');
const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');

const storage = multer.diskStorage(
  {
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
    },
  },
);

const upload = multer({ storage });

router.get('/enriched', async (req, res) => {
  const files = await fs.readdir(enrichedDir);
  res.status(200).json(files);
});

router.get('/upload', async (req, res) => {
  const files = await fs.readdir(uploadDir);
  res.status(200).json(files);
});

router.get('/enriched/:filename', async (req, res, next) => {
  const { filename } = req.params;
  const { error } = joi.string().trim().required().validate(filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  if (!await fs.pathExists(path.resolve(enrichedDir, filename))) {
    return next(boom.notFound(`"${filename}" not found`));
  }

  return res.sendFile(path.resolve(enrichedDir, filename));
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next(boom.badRequest('File not sent'));
  const { filename } = req?.file;
  return res.status(200).json({ id: path.parse(filename).name });
});

module.exports = router;
