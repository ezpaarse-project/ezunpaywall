const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

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
 * @apiSuccess report
 */
router.get('/report', async (req, res, next) => {
  const { latest } = req.query;
  const { date } = req.query;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(reportsDir);
    } catch (err) {
      return next(err);
    }

    if (!latestFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    let report;
    try {
      report = await getReport(latestFile?.filename);
    } catch (err) {
      return next(err);
    }
    return res.status(200).json({ report });
  }
  if (date) {
    if (new Date(date).getTime() > Date.now()) {
      return res.status(400).json({ message: 'date cannot be in the futur' });
    }
    const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

    if (!pattern.test(date)) {
      return res.status(400).json({ message: 'date are in wrong format, required YYYY-mm-dd' });
    }

    const files = await fs.readdir(reportsDir);
    const file = files.find((filename) => {
      const datefile = filename.split('.')[0];
      return date === datefile;
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    let report;

    try {
      report = await getReport(file);
    } catch (err) {
      return next(err);
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
 * @apiSuccess report
 */
router.get('/report/:filename', async (req, res, next) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(reportsDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'File not found' });
  }

  let report;
  try {
    report = await getReport(filename);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ report });
});

module.exports = router;
