const router = require('express').Router();

const { getReportsController, getReportByFilenameController } = require('../../controllers/update/report');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');
const { validateQueryType } = require('../../middlewares/format/type');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest and type.
 */
router.get('/reports', validateQueryType, validateLatest, getReportsController);

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/reports/:filename', validateFilename, getReportByFilenameController);

module.exports = router;
