const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  getNamesOfFilesInDir,
} = require('../services/accesToOutFiles');

const outDir = path.resolve(__dirname, '..', '..', 'out');
/**
 * @api {get} /reports get all reports
 * @apiName getReports
 * @apiGroup Homepage
 *
 * @apiParam (QUERY) {String} latest
 */
router.get('/reports', async (req, res) => {
  let { latest, status } = req.query;
  if (!latest) latest = false;
  if (!status) status = '';
  const reportDir = path.resolve(outDir, 'reports');
  const files = await getNamesOfFilesInDir(reportDir, latest, status);
  return res.status(200).json({
    files,
  });
});

/**
 * @api {get} /download get all download
 * @apiName getDownload
 * @apiGroup Homepage
 *
 * @apiParam (QUERY) {String} latest
 */
router.get('/download', async (req, res) => {
  const downloadDir = path.resolve(outDir, 'download');
  const files = await getNamesOfFilesInDir(downloadDir, false);
  return res.status(200).json({
    files,
  });
});

/**
 * @api {get} /download get all download
 * @apiName getDownload
 * @apiGroup Homepage
 *
 * @apiParam (QUERY) {String} latest
 */
router.get('/download/:file', async (req, res) => {
  const downloadDir = path.resolve(outDir, 'download');
  const { file } = req.params;
  if (!file) {
    return res.status(400).json({ message: 'name of snapshot file expected' });
  }
  const exist = await fs.pathExists(path.resolve(downloadDir, file));
  if (exist) {
    return res.status(200).json(true);
  }
  return res.status(404).json('file doesn\'t exist');
});

/**
 * @api {get} /logs get all logs
 * @apiName getLogs
 * @apiGroup Homepage
 *
 * @apiParam (QUERY) {String} latest
 */
router.get('/logs', async (req, res) => {
  const logsDir = path.resolve(outDir, 'logs');
  const files = await getNamesOfFilesInDir(logsDir, false);
  return res.status(200).json({
    files,
  });
});

module.exports = router;
