const joi = require('joi');

/**
 * Check if type is correct.
 *
 * @param {*} type - type of job
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 *
 * @returns
 */
function validateType(type, req, res, next) {
  const { error, value } = joi.string().trim().valid('dataUpdate', 'dataUpdateHistory').validate(type);
  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data.type = value;

  return next();
}

/**
 * Joi middleware to check if type in param is correct.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function validateParamsType(req, res, next) {
  const { type } = req.params;
  return validateType(type, req, res, next);
}

/**
 * Joi middleware to check if type in query is correct.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
function validateQueryType(req, res, next) {
  const { type } = req.query;
  return validateType(type, req, res, next);
}

module.exports = {
  validateParamsType,
  validateQueryType,
};
