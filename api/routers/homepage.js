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

/**
 * @api {get} /download get all download
 * @apiName getDownload
 * @apiGroup Homepage
 *
 * @apiParam (PARAMS) {String} latest
 */
router.get('/download', async (req, res) => {
  const downloadDir = path.resolve(__dirname, '..', '..', 'download');
  const files = await getNamesOfFilesInDir(downloadDir, false);
  return res.status(200).json({
    type: 'success', data: files,
  });
});

/**
 * @api {get} /status get all status
 * @apiName getStatus
 * @apiGroup Homepage
 *
 * @apiParam (PARAMS) {String} latest
 */
router.get('/status', async (req, res) => {
  let { latest } = req.query;
  if (!latest) latest = false;
  const statusDir = path.resolve(__dirname, '..', '..', 'status');
  const files = await getNamesOfFilesInDir(statusDir, latest);
  return res.status(200).json({
    type: 'success', data: files,
  });
});


module.exports = router;
