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
  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(reportsDir);
    } catch (err) {
      return next(err);
    }

    let report;
    try {
      report = await getReport(latestFile?.filename);
    } catch (err) {
      return next(err);
    }
    return res.status(200).json({ report });
  }
  const reports = await fs.readdir(reportsDir);
  return res.status(200).json(reports);
});

module.exports = router;
