const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs-extra');

const uploadDir = path.resolve(__dirname, '..', 'data', 'upload');

const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      const apikey = req.get('x-api-key');
      const dir = path.resolve(uploadDir, apikey);
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

module.exports = upload;
