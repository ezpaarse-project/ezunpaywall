const multer = require('multer');

const dirPath = require('../path');

const storage = multer.diskStorage(
  {
    destination: dirPath.snapshotsDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

module.exports = upload;
