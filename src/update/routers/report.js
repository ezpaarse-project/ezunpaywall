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
router.get('/report', async (req, res, next) => {
  const { error, value } = joi.object({
    latest: joi.boolean().default(false),
    date: joi.date().format('YYYY-MM-DD'),
  }).validate(req.query);

  if (error) return next(boom.badRequest(error.details[0].message));

  const { latest, date } = value;

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
    return res.status(200).json({ report });
  }
  if (date) {
    if (new Date(date).getTime() > Date.now()) {
      return res.status(400).json({ message: 'date cannot be in the futur' });
    }
    const files = await fs.readdir(reportsDir);
    const file = files.find((filename) => {
      const datefile = filename.split('.')[0];
      return date === datefile;
    });

    if (!file) {
      return next(boom.notFound('File not found'));
    }

    let report;

    try {
      report = await getReport(file);
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
router.get('/report/:filename', async (req, res, next) => {
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
  return res.status(200).json({ report });
});

module.exports = router;
