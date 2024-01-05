const joi = require('joi');

/**
 * Joi middleware to check if interval in body is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateInterval(req, res, next) {
  const { error, value } = joi.string().trim().valid('week', 'day').default('day')
    .validate(req.body.interval);

  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data.interval = value;

  return next();
}

module.exports = validateInterval;
