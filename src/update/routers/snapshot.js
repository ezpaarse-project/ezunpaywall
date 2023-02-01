const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');
const joi = require('joi').extend(require('@hapi/joi-date'));

const {
  deleteFile,
} = require('../controllers/snapshot');

const {
  getMostRecentFile,
} = require('../controllers/file');

const snapshotsDir = path.resolve(__dirname, '..', 'data', 'snapshots');

const storage = multer.diskStorage(
  {
    destination: snapshotsDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

router.get('/snapshots', async (req, res, next) => {
  const { error, value } = joi.boolean().default(false).validate(req.query.latest);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const latest = value;

  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(snapshotsDir);
    } catch (err) {
      return next({ message: 'Cannot get the lastest snapshot', stackTrace: err });
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
router.post('/snapshots', upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ messsage: 'File not sent' });
  return res.status(200).json({ messsage: 'File added' });
});

/**
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @return 200 <filename> deleted
 */
router.delete('/snapshots/:filename', async (req, res, next) => {
  const { error, value } = joi.string().required().validate(req.params.filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const filename = value;

  if (!await fs.pathExists(path.resolve(snapshotsDir, filename))) {
    return next({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(filename);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }

  return res.status(200).json({ messsage: `File [${filename}] deleted` });
});

module.exports = router;
