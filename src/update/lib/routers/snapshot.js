const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const joi = require('joi').extend(require('@hapi/joi-date'));

const upload = require('../middlewares/multer');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

const {
  deleteFile,
} = require('../controllers/snapshot');

const {
  getMostRecentFile,
} = require('../controllers/file');

/**
 * Route that give the list of snapshots installed on ezunpaywall of the most recent file.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeQuery {String} latest - indicate if it gave latest snapshot or not.
 *
 * @routeResponse {Array<String>|<File>} List of filename of snapshot
 * or the latest snapshot
 *
 * @returns {Object} HTTP response.
 */
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
 * Route that upload a file on ezunpaywall.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.post('/snapshots', upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ messsage: 'File not sent' });
  return res.status(202).json();
});

/**
 * Route that delete a file on ezunpaywall.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeParam {String} filename - Filename.
 *
 * @returns {Object} HTTP response.
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

  return res.status(202).json();
});

module.exports = router;
