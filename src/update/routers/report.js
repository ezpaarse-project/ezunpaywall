const router = require('express').Router();
const path = require('path');

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
  // TODO use param filename and query latest
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
});

module.exports = router;
