const joi = require('joi').extend(require('@hapi/joi-date'));

async function validateNoChangefile(req, res, next) {
  const { error, value } = joi.object({
    startDate: joi.date().format('YYYY-MM-DD').required(),
    endDate: joi.date().format('YYYY-MM-DD').min(joi.ref('startDate')).required(),
  }).with('endDate', 'startDate').validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data = value;

  return next();
}

async function validateMailContact(req, res, next) {
  const { error, value } = joi.object({
    email: joi.string().email().required(),
    subject: joi.string().required(),
    message: joi.string().required(),
  }).with('endDate', 'startDate').validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  if (!req.data) {
    req.data = {};
  }

  req.data = value;

  return next();
}

module.exports = { validateNoChangefile, validateMailContact };
