const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const boom = require('@hapi/boom');
const joi = require('joi').extend(require('@hapi/joi-date'));

const {
  getMostRecentFile,
} = require('../lib/file');

const {
  getState,
} = require('../bin/state');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');

/**
 * get the most recent state in JSON format
 * @return state
 */
router.get('/state', async (req, res, next) => {
  const schema = joi.object({
    latest: joi.boolean().default(false),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(boom.badRequest(error.details[0].message));
  }

  const { latest } = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(statesDir);
    } catch (err) {
      return next(err.isBoom());
    }
    let state;
    try {
      state = await getState(latestFile?.filename);
    } catch (err) {
      return next(err.isBoom());
    }
    return res.status(200).json(state);
  }
  const states = await fs.readdir(statesDir);
  return res.status(200).json(states);
});

/**
 * get state in JSON format
 *
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @return state
 */
router.get('/state/:filename', async (req, res, next) => {
  const schema = joi.object({
    filename: joi.string().required(),
  });

  const { error, value } = schema.validate(req.query);

  if (error) {
    return next(boom.badRequest(error.details[0].message));
  }

  const { filename } = value;

  if (await fs.pathExists(path.resolve(statesDir, filename))) {
    return next(boom.notFound('File not found'));
  }

  let state;
  try {
    state = await getState(filename);
  } catch (err) {
    return next(err.isBoom());
  }
  return res.status(200).json(state);
});

module.exports = router;
