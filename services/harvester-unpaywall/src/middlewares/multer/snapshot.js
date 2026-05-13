const multer = require('multer');

const { paths } = require('config');

const storage = multer.diskStorage(
  {
    destination: paths.data.snapshotsDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

module.exports = upload;
