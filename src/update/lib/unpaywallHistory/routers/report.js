const router = require('express').Router();

const { getReports, getReportByFilename } = require('../../controllers/report');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');
const updateType = require('../../middlewares/type');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest.
 */
router.get('/unpaywall/history/reports', validateLatest, updateType, getReports);

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/unpaywall/history/reports/:filename', validateFilename, updateType, getReportByFilename);

module.exports = router;
