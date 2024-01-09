const joi = require('joi');

/**
 * Joi middleware to check if type in param is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateType(req, res, next) {
  const { type } = req.params;

  const { error, value } = joi.string().trim().valid('unpaywall', 'unpaywallHistory').validate(type);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data.type = value;

  return next();
}

module.exports = validateType;
