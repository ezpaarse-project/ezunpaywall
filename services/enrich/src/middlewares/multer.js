const multer = require('multer');
const uuid = require('uuid');
const path = require('path');
const fsp = require('fs/promises');
const { paths } = require('config');

/**
 * Download middleware for the enrichment process.
 * It names the downloaded file with a uuid and puts it ./data/<apikey>.
 */
const storage = multer.diskStorage(
  {
    destination: async (req, file, cb) => {
      try {
        const apikey = req.get('x-api-key');
        const dir = path.resolve(paths.data.uploadDir, apikey);
        await fsp.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      cb(null, `${uuid.v4()}${path.extname(file.originalname)}`);
    },
  },
);

const upload = multer({ storage });

module.exports = upload;
