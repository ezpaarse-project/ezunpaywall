const joi = require('joi');

/**
 * Joi middleware to check if filename in param is correct.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function validateFilename(req, res, next) {
  const { filename } = req.params;

  const { error, value } = joi.string().trim().required().validate(filename);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data.filename = value;

  return next();
}

module.exports = validateFilename;
