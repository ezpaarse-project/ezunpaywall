const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs-extra');

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

module.export = upload;
