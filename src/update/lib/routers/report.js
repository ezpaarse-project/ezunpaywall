const router = require('express').Router();

const {
  getReports,
  getReportByFilename,
} = require('../controllers/report');

const validateLatest = require('../middlewares/latest');
const validateFilename = require('../middlewares/filename');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest.
 */
router.get('/reports', validateLatest, getReports);

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/reports/:filename', validateFilename, getReportByFilename);

module.exports = router;
