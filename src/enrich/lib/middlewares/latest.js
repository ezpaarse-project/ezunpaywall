const joi = require('joi');

/**
 * Joi middleware to check if latest in query is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateLatest(req, res, next) {
  const { error, value } = joi.boolean().default(false).validate(req?.query?.latest);
  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = value;

  return next();
}

module.exports = validateLatest;
