const router = require('express').Router();

const { getReports, getReportByFilename } = require('../controllers/report');

const validateLatest = require('../middlewares/format/latest');
const validateFilename = require('../middlewares/format/filename');
const validateType = require('../middlewares/format/type');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest.
 */
router.get('/reports/:type', validateType, validateLatest, getReports);

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/reports/:type/:filename', validateType, validateFilename, getReportByFilename);

module.exports = router;
