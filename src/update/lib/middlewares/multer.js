const path = require('path');
const multer = require('multer');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

const storage = multer.diskStorage(
  {
    destination: snapshotsDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

module.exports = upload;
