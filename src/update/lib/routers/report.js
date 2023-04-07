const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const joi = require('joi').extend(require('@hapi/joi-date'));

const {
  getMostRecentFile,
} = require('../controllers/file');

const {
  getReport,
} = require('../controllers/report');

const reportsDir = path.resolve(__dirname, '..', '..', 'data', 'reports');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest.
 */
router.get('/reports', async (req, res, next) => {
  const { error, value } = joi.object({
    latest: joi.boolean().default(false),
  }).validate(req.query);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const { latest } = value;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(reportsDir);
    } catch (err) {
      return next({ message: err, stackTrace: err });
    }

    if (!latestFile) {
      return next({ message: 'No reports are available' });
    }

    let report;
    try {
      report = await getReport(latestFile?.filename);
    } catch (err) {
      return next({ message: `Cannot get [${latestFile?.filename}] latest report`, stackTrace: err });
    }
    return res.status(200).json(report);
  }

  let reports = await fs.readdir(reportsDir);

  reports = reports.sort((a, b) => {
    const [date1] = a.split('.');
    const [date2] = b.split('.');
    return new Date(date2).getTime() - new Date(date1).getTime();
  });

  return res.status(200).json(reports);
});

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/reports/:filename', async (req, res, next) => {
  const { error, value } = joi.string().trim().required().validate(req.params.filename);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const filename = value;

  try {
    await fs.stat(path.resolve(reportsDir, filename));
  } catch (err) {
    return next({ message: `File [${filename}] not found` });
  }

  let report;
  try {
    report = await getReport(filename);
  } catch (err) {
    return next({ message: `Cannot get ${filename} report`, stackTrace: err });
  }
  return res.status(200).json(report);
});

module.exports = router;
