const router = require('express').Router();
const path = require('path');
const boom = require('@hapi/boom');
const joi = require('joi');
const fs = require('fs-extra');

const {
  getState,
} = require('../model/state');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');

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

router.get('/state', async (req, res, next) => {
  const { error, value } = joi.boolean().default(false).validate(req?.query?.latest);
  if (error) return next(boom.badRequest(error.details[0].message));

  const latest = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(statesDir);
    } catch (err) {
      return next(boom.boomify(err));
    }
    let state;
    try {
      state = await getState(latestFile?.filename);
    } catch (err) {
      return next(boom.boomify(err));
    }
    return res.status(200).json(state);
  }
  let states;

  try {
    states = await fs.readdir(statesDir);
  } catch (err) {
    return next(boom.boomify(err));
  }

  return res.status(200).json(states);
});

router.get('/state/:filename', async (req, res, next) => {
  const { filename } = req.params;
  const { error } = joi.string().trim().required().validate(filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  if (!await fs.pathExists(path.resolve(statesDir, filename))) {
    return next(boom.notFound(`"${filename}" not found`));
  }

  let state;
  try {
    state = await getState(filename);
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(200).json(state);
});

module.exports = router;
