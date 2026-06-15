const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { paths } = require('config');

const router = require('express').Router();

const upload = require('../../middlewares/uploadChangefile');
const checkAdmin = require('../../middlewares/admin');
const dev = require('../../middlewares/dev');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');

const { getMostRecentFile, deleteFile } = require('../../lib/files');

/**
 * Route that give the list of changefiles installed on ezunpaywall or the most recent file.
 * Auth required.
 *
 * This route can take in query latest.
 */
router.get('/changefiles', checkAdmin, validateLatest, async (req, res, next) => {
  const { latest } = req.data;

  if (latest) {
    let latestChangefile;
    try {
      latestChangefile = await getMostRecentFile(paths.data.changefilesDir);
    } catch (err) {
      return next({ message: 'Cannot get the latest changefile' });
    }
    return res.status(200).json(latestChangefile?.filename);
  }
  const files = await fsp.readdir(paths.data.changefilesDir);
  return res.status(200).json(files.reverse());
});

/**
 * Route that upload a changefile on ezunpaywall.
 * Auth required.
 * Using for test.
 *
 * This route need a body that contains the file to upload.
 */
router.post('/changefiles', dev, checkAdmin, upload.single('file'), async (req, res, next) => {
  if (!req?.file) return next({ message: 'File not sent' });
  return res.status(202).json();
});

/**
 * Route that delete a changefile on ezunpaywall.
 * Auth required.
 */
router.delete('/changefiles/:filename', checkAdmin, validateFilename, async (req, res, next) => {
  const { filename } = req.data;

  if (!await fs.existsSync(path.resolve(paths.data.changefilesDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  try {
    await deleteFile(path.resolve(paths.data.changefilesDir, filename));
  } catch (err) {
    return next({ message: err.message });
  }

  return res.status(202).json();
});

module.exports = router;
