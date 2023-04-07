const router = require('express').Router();
const joi = require('joi');
const fs = require('fs-extra');
const path = require('path');

const {
  enrichJSON,
  enrichCSV,
} = require('../controllers/job');

const checkAuth = require('../middlewares/auth');

const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');

/**
 * Route that start a enrich job.
 *
 * This route need a body that contains a config of job
 * and a param filename which corresponds to the upload filename
 */
router.post('/job/:filename', checkAuth, async (req, res) => {
  const checkParams = joi.string().trim().required().validate(req.params.filename);

  if (checkParams?.error) {
    return res.status(400).json({ message: checkParams?.error?.details[0].message });
  }

  const id = checkParams?.value;
  // TODO check args with graphqlSyntax
  const { error, value } = joi.object({
    type: joi.string().trim().valid('jsonl', 'csv').required(),
    args: joi.string().trim(),
    index: joi.string().trim().default('unpaywall'),
    separator: joi.string().trim().default(','),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const apikey = req.get('x-api-key');

  const {
    type, args, index, separator,
  } = value;

  if (!await fs.pathExists(path.resolve(uploadDir, apikey, `${id}.${type}`))) {
    return res.status(404).json({ message: `[file] ${id}.${type} not found` });
  }

  if (type === 'jsonl') {
    enrichJSON(id, index, args, apikey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apikey, separator);
  }

  return res.status(200).json(id);
});

module.exports = router;
