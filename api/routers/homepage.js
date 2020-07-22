const router = require('express').Router();
const path = require('path');

const {
  getNamesOfFilesInDir,
} = require('../services/homepage');
/**
 * @api {get} /reports get all reports
 * @apiName getReports
 * @apiGroup Homepage
 *
 * @apiParam (PARAMS) {String} latest
 */
router.get('/reports', async (req, res) => {
  let { latest } = req.query;
  if (!latest) latest = false;
  const reportDir = path.resolve(__dirname, '..', '..', 'reports');
  const files = await getNamesOfFilesInDir(reportDir, latest);
  return res.status(200).json({
    type: 'success', data: files,
  });
});

module.exports = router;
