const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const multer = require('multer');

const {
  deleteSnapshot,
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
  const { latest } = req.query;
  if (latest) {
    let latestSnapshot;
    try {
      latestSnapshot = await getMostRecentFile(snapshotsDir);
    } catch (err) {
      return next(err);
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
 * @apiSuccess 200 file added
 */
router.post('/snapshot', upload.single('file'), async (req, res) => {
  if (!req?.file) {
    return res.status(403).json({ messsage: 'file not send' });
  }
  // TODO return name of file
  return res.status(200).json({ messsage: 'file added' });
});

/**
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @apiSuccess 200 <filename> deleted
 */
router.delete('/snapshot/:filename', async (req, res, next) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'File not found' });
  }
  try {
    await deleteSnapshot(filename);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ messsage: `${filename} deleted` });
});

module.exports = router;
