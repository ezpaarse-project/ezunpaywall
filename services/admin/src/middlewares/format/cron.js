const joi = require('joi').extend(require('@hapi/joi-date'));

/**
 * Validate cron config according to type.
 *
 * @param {string} type Type of cron.
 * @param {Object} body Body of express request.
 *
 * @returns {Object} return value or error.
 */
function checkCronConfig(type, body) {
  switch (type) {
    case 'dataUpdate':
      return joi.object({
        schedule: joi.string().trim(),
        index: joi.string().trim(),
        interval: joi.string().trim().valid('day', 'week'),
      }).validate(body);

    case 'dataUpdateHistory':
      return joi.object({
        schedule: joi.string().trim(),
        indexBase: joi.string().trim(),
        indexHistory: joi.string().trim(),
        interval: joi.string().trim().valid('day', 'week'),
      }).validate(body);
    default:
  }
  return false;
}

/**
 * Joi middleware to check if cron config is correct.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function validateCronConfig(req, res, next) {
  const { type } = req.params;

  const { error, value } = checkCronConfig(type, req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data.cronConfig = value;

  return next();
}

module.exports = validateCronConfig;
