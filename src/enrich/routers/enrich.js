const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const joi = require('joi');
const boom = require('@hapi/boom');

const multer = require('multer');
const uuid = require('uuid');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');

const checkAuth = require('../middlewares/auth');
const checkAdmin = require('../middlewares/admin');

const uploadedDir = path.resolve(__dirname, '..', 'out', 'uploaded');

const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      const apikey = req.get('x-api-key');
      const dir = path.resolve(uploadedDir, apikey);
      fs.exists(dir, (exist) => {
        if (!exist) {
          return fs.mkdir(dir, (error) => cb(error, dir));
        }
        return cb(null, dir);
      });
    },
    filename: (req, file, cb) => {
      cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
    },
  },
);

const upload = multer({ storage });

router.get('/enriched', checkAdmin, async (req, res) => {
  const files = await fs.readdir(enrichedDir);
  res.status(200).json(files);
});

router.get('/uploaded', async (req, res) => {
  const files = await fs.readdir(uploadedDir);
  res.status(200).json(files);
});

router.get('/enriched/:filename', checkAuth, async (req, res, next) => {
  const { filename } = req.params;

  const { error } = joi.string().trim().required().validate(filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  const apikey = req.get('x-api-key');

  if (!await fs.pathExists(path.resolve(enrichedDir, apikey, filename))) {
    return next(boom.notFound(`"${filename}" not found`));
  }

  return res.sendFile(path.resolve(enrichedDir, apikey, filename));
});

router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next(boom.badRequest('File not sent'));
  const { filename } = req?.file;
  return res.status(200).json({ messsage: 'file added', filename, id: path.parse(filename).name });
});

module.exports = router;
