const joi = require('joi').extend(require('@hapi/joi-date'));

/**
 * Joi middleware to check if cron config is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateCronConfig(req, res, next) {
  const { error, value } = joi.object({
    time: joi.string().trim(),
    index: joi.string().trim(),
    interval: joi.string().trim().valid('day', 'week'),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = value;

  return next();
}

module.exports = validateCronConfig;
