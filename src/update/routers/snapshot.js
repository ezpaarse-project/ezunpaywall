const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const boom = require('@hapi/boom');
const joi = require('joi').extend(require('@hapi/joi-date'));

const {
  deleteFile,
} = require('../bin/snapshot');

const {
  getMostRecentFile,
} = require('../lib/file');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const storage = multer.diskStorage(
  {
    destination: snapshotsDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

router.get('/snapshot', async (req, res, next) => {
  const { error, value } = joi.boolean().default(false).validate(req.query.latest);

  if (error) return next(boom.badRequest(error.details[0].message));

  const latest = value;

  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(snapshotsDir);
    } catch (err) {
      return next(boom.boomify(err));
    }
    return res.status(200).json(latestSnapshot?.filename);
  }
  const files = await fs.readdir(snapshotsDir);
  return res.status(200).json(files);
});

/**
 * @apiError 500 internal server error
 * @apiError 403 file not send
 *
 * @return 200 file added
 */
router.post('/snapshot', upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next(boom.badRequest('File not sent'));
  return res.status(200).json({ messsage: 'file added' });
});

/**
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @return 200 <filename> deleted
 */
router.delete('/snapshot/:filename', async (req, res, next) => {
  const { error, value } = joi.string().required().validate(req.params.filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  const filename = value;

  if (!await fs.pathExists(path.resolve(snapshotsDir, filename))) {
    return next(boom.notFound('File not found'));
  }

  try {
    await deleteFile(filename);
  } catch (err) {
    return next(boom.boomify(err));
  }

  return res.status(200).json({ messsage: `${filename} deleted` });
});

module.exports = router;
