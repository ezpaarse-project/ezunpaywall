const router = require('express').Router();
const path = require('path');
const joi = require('joi');
const fs = require('fs-extra');

const {
  getState,
} = require('../model/state');

const statesDir = path.resolve(__dirname, '..', 'data', 'states');

/**
 * get the files in a dir in order by date
 * @param {String} dir - dir path
 * @returns {array<string>} files path in order
 */
async function orderRecentFiles(dir) {
  const filenames = await fs.readdir(dir);

  const files = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.resolve(dir, filename);
      return {
        filename,
        stat: await fs.lstat(filePath),
      };
    }),
  );

  return files
    .filter((file) => file.stat.isFile())
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
}

const getMostRecentFile = async (dir) => {
  const files = await orderRecentFiles(dir);
  return Array.isArray(files) ? files[0] : undefined;
};

router.get('/states', async (req, res, next) => {
  const { error, value } = joi.boolean().default(false).validate(req?.query?.latest);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const latest = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(statesDir);
    } catch (err) {
      return next({ message: err, stackTrace: err });
    }
    let state;
    try {
      state = await getState(latestFile?.filename);
    } catch (err) {
      return next({ message: err, stackTrace: err });
    }
    return res.status(200).json(state);
  }
  let states;

  try {
    states = await fs.readdir(statesDir);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }

  return res.status(200).json(states);
});

router.get('/states/:filename', async (req, res, next) => {
  const { filename } = req.params;

  const { errorParam } = joi.string().trim().required().validate(filename);
  if (errorParam) return res.status(400).json({ message: errorParam.details[0].message });

  const apikey = req.get('x-api-key');

  const { errorHeader } = joi.string().trim().required().validate(apikey);
  if (errorHeader) return res.status(400).json({ message: errorHeader.details[0].message });

  if (!await fs.pathExists(path.resolve(statesDir, apikey, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  let state;
  try {
    state = await getState(filename, apikey);
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }
  return res.status(200).json(state);
});

module.exports = router;
