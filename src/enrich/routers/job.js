const router = require('express').Router();
const boom = require('@hapi/boom');
const joi = require('joi');

const {
  enrichJSON,
  enrichCSV,
} = require('../bin/utils');

const checkAuth = require('../middlewares/auth');

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

  const {
    id, type, args, index, separator,
  } = value;

  const apiKey = req.get('x-api-key');

  if (type === 'jsonl') {
    enrichJSON(id, index, args, apiKey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apiKey, separator);
  }

  return res.status(200).json({ id });
});

module.exports = router;
