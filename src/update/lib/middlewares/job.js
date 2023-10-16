const joi = require('joi').extend(require('@hapi/joi-date'));

/**
 * Joi middleware to check if job config of dowload and insert snapshot is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
function validateSnapshotJob(req, res, next) {
  const { error, value } = joi.string().trim().default('unpaywall').validate(req.body.index);

  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = value;

  return next();
}

/**
 * Joi middleware to check if job config of download ans insert changefiles is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateJobChangefilesConfig(req, res, next) {
  const { error, value } = joi.object({
    index: joi.string().trim().default('unpaywall'),
    interval: joi.string().trim().valid('day', 'week').default('day'),
    startDate: joi.date().format('YYYY-MM-DD'),
    endDate: joi.date().format('YYYY-MM-DD').min(joi.ref('startDate')),
  }).with('endDate', 'startDate').validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  req.data = value;

  return next();
}

/**
 * Joi middleware to check if job config of insert file is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function validateInsertFile(req, res, next) {
  const { filename } = req.params;

  const snapshotPattern = /^[a-zA-Z0-9_.-]+(.gz)$/;

  const { error } = joi.string().trim().regex(snapshotPattern).required()
    .validate(filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const checkBody = joi.object({
    index: joi.string().trim().default('unpaywall'),
    offset: joi.number().greater(-1).default(0),
    limit: joi.number().greater(joi.ref('offset')).default(-1),
  }).validate(req.body);

  if (checkBody.error) return res.status(400).json({ message: checkBody.error.details[0].message });

  const { index, offset, limit } = checkBody.value;
  req.data = {
    filename, index, offset, limit,
  };

  return next();
}

module.exports = {
  validateSnapshotJob,
  validateJobChangefilesConfig,
  validateInsertFile,
};
