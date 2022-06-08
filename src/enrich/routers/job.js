const router = require('express').Router();
const boom = require('@hapi/boom');
const joi = require('joi');
const fs = require('fs-extra');
const path = require('path');

const {
  enrichJSON,
  enrichCSV,
} = require('../bin/utils');

const checkAuth = require('../middlewares/auth');

const uploadedDir = path.resolve(__dirname, '..', 'out', 'uploaded');

/**
 *
 *
 * @return name of enriched file to download it
 */
router.post('/job', checkAuth, async (req, res, next) => {
  // TODO check args with graphqlSyntax
  const { error, value } = joi.object({
    id: joi.string().trim().required(),
    type: joi.string().trim().valid('jsonl', 'csv').required(),
    args: joi.string().trim(),
    index: joi.string().trim().default('unpaywall'),
    separator: joi.string().trim().default(','),
  }).validate(req.body);

  if (error) return next(boom.badRequest(error.details[0].message));

  const apikey = req.get('x-api-key');

  const {
    id, type, args, index, separator,
  } = value;

  if (!await fs.pathExists(path.resolve(uploadedDir, apikey, `${id}.${type}`))) {
    return next(boom.notFound(`${id}.${type} not found`));
  }

  if (type === 'jsonl') {
    enrichJSON(id, index, args, apikey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apikey, separator);
  }

  return res.status(200).json({ id });
});

module.exports = router;
