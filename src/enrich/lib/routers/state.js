const router = require('express').Router();
const path = require('path');
const joi = require('joi');
const fs = require('fs-extra');

const checkAuth = require('../middlewares/auth');

const getMostRecentFile = require('../controllers/file');

const {
  getState,
} = require('../models/state');

const statesDir = path.resolve(__dirname, '..', '..', 'data', 'states');

/**
 * Route that give list of filename of state or the content of latest
 * state.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following in error handler.
 *
 * @routeResponse {Array<string>} List of filename of state
 * @routeResponse {Object} Content of latest state in json
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/states', checkAuth, async (req, res, next) => {
  const { error, value } = joi.boolean().default(false).validate(req?.query?.latest);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  const latest = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(path.resolve(statesDir, apikey));
    } catch (err) {
      return next({ message: err });
    }
    let state;
    try {
      state = await getState(latestFile?.filename, apikey);
    } catch (err) {
      return next({ message: err });
    }
    return res.status(200).json(state);
  }
  let states;

  try {
    states = await fs.readdir(path.resolve(statesDir, apikey));
  } catch (err) {
    return next({ message: err });
  }

  return res.status(200).json(states);
});

/**
 * Route that give the content of state.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeParams {string} Filename of state.
 *
 * @routeResponse {Object} Content of latest state in json
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/states/:filename', checkAuth, async (req, res, next) => {
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
