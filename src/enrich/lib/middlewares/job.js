const joi = require('joi');

/**
 * Joi middleware to check if config of job is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateJobConfig(req, res, next) {
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
    prefix: joi.string().trim().default(''),
    separator: joi.string().trim().default(','),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = { id, config: value };
  return next();
}

module.exports = validateJobConfig;
