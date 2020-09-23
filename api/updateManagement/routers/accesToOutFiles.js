const router = require('express').Router();
const path = require('path');

const {
  getNamesOfFilesInDir,
} = require('../services/accesToOutFiles');

const outDir = path.resolve(__dirname, '..', '..', 'out');
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
  const reportDir = path.resolve(outDir, 'reports');
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
  const downloadDir = path.resolve(outDir, 'download');
  const files = await getNamesOfFilesInDir(downloadDir, false);
  return res.status(200).json({
    type: 'success', data: files,
  });
});

/**
 * @api {get} /logs get all logs
 * @apiName getLogs
 * @apiGroup Homepage
 *
 * @apiParam (PARAMS) {String} latest
 */
router.get('/logs', async (req, res) => {
  const logsDir = path.resolve(outDir, 'logs');
  const files = await getNamesOfFilesInDir(logsDir, false);
  return res.status(200).json({
    type: 'success', data: files,
  });
});

module.exports = router;
