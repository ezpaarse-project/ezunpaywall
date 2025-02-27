const joi = require('joi');

const {
  availableAccess,
  unpaywallAttrs,
} = require('../lib/unpaywall/attributes');

/**
 * Joi middleware to check if apikey is in params.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function validateApikey(req, res, next) {
  const { apikey } = req.params;
  const { error } = joi.string().trim().required().validate(apikey);

  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = apikey;
  return next();
}

/**
 * Joi middleware to check if apikey config in body matches the schema.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function validateCreateApikey(req, res, next) {
  const { error, value: apikeyConfig } = joi.object({
    name: joi.string().trim().required(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)).default(['*']),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)).default(['graphql']),
    owner: joi.string().trim().optional().allow(''),
    description: joi.string().trim().optional().allow(''),
    allowed: joi.boolean().default(true),
  }).validate(req?.body);

  if (error) return res.status(400).json({ message: error?.details?.[0]?.message });

  req.data = apikeyConfig;
  return next();
}

/**
 * Joi middleware to check if apikey is in params and if apikey config in body matches the schema.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function validateUpdateApiKey(req, res, next) {
  const checkParams = joi.string().trim().required().validate(req.params.apikey);

  if (checkParams?.error) {
    return res.status(400).json({ message: checkParams?.error?.details[0].message });
  }

  const apikey = checkParams?.value;

  const { error, value: apikeyConfig } = joi.object({
    name: joi.string().trim(),
    attributes: joi.array().items(joi.string().trim().valid(...unpaywallAttrs)),
    access: joi.array().items(joi.string().trim().valid(...availableAccess)),
    owner: joi.string().trim().optional().allow(''),
    description: joi.string().trim().optional().allow(''),
    allowed: joi.boolean().default(true),
  }).validate(req.body);

  if (error) {
    return res.status(400).json({ message: error?.details[0].message });
  }

  req.data = { apikey, apikeyConfig };

  return next();
}

/**
 * Joi middleware to check if apikeys config is in an array
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function validateLoadApikey(req, res, next) {
  const { error, value } = joi.array().validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = value;
  return next();
}

module.exports = {
  validateApikey,
  validateCreateApikey,
  validateUpdateApiKey,
  validateLoadApikey,
};
