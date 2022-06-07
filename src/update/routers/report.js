const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const boom = require('@hapi/boom');
const joi = require('joi').extend(require('@hapi/joi-date'));

const {
  getMostRecentFile,
} = require('../lib/file');

const {
  getReport,
} = require('../bin/report');

const reportsDir = path.resolve(__dirname, '..', 'out', 'reports');

/**
 * get the most recent report in JSON format
 *
 * @return report
 */
router.get('/reports', async (req, res, next) => {
  const { error, value } = joi.object({
    latest: joi.boolean().default(false),
  }).validate(req.query);

  if (error) return next(boom.badRequest(error.details[0].message));

  const { latest } = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(reportsDir);
    } catch (err) {
      return next(boom.boomify(err));
    }

    if (!latestFile) {
      return next(boom.notFound('File not found'));
    }

    let report;
    try {
      report = await getReport(latestFile?.filename);
    } catch (err) {
      return next(boom.boomify(err));
    }
    return res.status(200).json(report);
  }
  const reports = await fs.readdir(reportsDir);
  return res.status(200).json(reports);
});

/**
 * get report in JSON format
 *
 * @apiError 400 filename expected
 * @apiError 404 File not found
 *
 * @return report
 */
router.get('/reports/:filename', async (req, res, next) => {
  const { error, value } = joi.string().trim().required().validate(req.params.filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  const filename = value;

  try {
    await fs.stat(path.resolve(reportsDir, filename));
  } catch (err) {
    return next(boom.notFound('File not found'));
  }

  let report;
  try {
    report = await getReport(filename);
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(200).json(report);
});

module.exports = router;
