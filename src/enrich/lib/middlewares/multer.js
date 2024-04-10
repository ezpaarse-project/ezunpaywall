const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs-extra');
const { paths } = require('config');

/**
 * Download middleware for the enrichment process.
 * It names the downloaded file with a uuid and puts it ./data/<apikey>.
 */
const storage = multer.diskStorage(
  {
    destination: (req, file, cb) => {
      const apikey = req.get('x-api-key');
      const dir = path.resolve(paths.data.uploadDir, apikey);
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
