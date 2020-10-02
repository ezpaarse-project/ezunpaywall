const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  getNamesOfFilesInDir,
} = require('../services/accesToOutFiles');

const outDir = path.resolve(__dirname, '..', '..', 'out');

/**
 * @api {get} /report get all reports
 * @apiName getNameOfAllReports
 * @apiGroup OutFiles
 * 
 * @apiSuccess {Array<String>} array of name of reports file
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
 * @api {get} /report/:name get content of report file by name
 * @apiName getContentOfReportByName
 * @apiGroup OutFiles
 *
 * @apiParam (PARAMS) {String} name name of file
 *
 * @apiSuccess {String} Content of report file
 * 
 * @apiError 400 name of snapshot file expected
 * @apiError 404 file doesn't exist
 */
router.get('/reports/:name', async (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ message: 'name of report file expected' });
  }
  const file = path.resolve(outDir, 'reports', name);
  const ifFileExist =  await fs.pathExists(path.resolve(file));
  if (!ifFileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  const contentFile = await fs.readFile(file, 'utf8');
  const contentFileParsed = JSON.parse(contentFile);
  return res.status(200).json({
    ...contentFileParsed,
  });
});

/**
 * @api {get} /download get all download
 * @apiName getNameOfDownload
 * @apiGroup OutFiles
 * 
 * @apiSuccess {Array<String>} array of name of downloaded file
 *
 */
router.get('/download', async (req, res) => {
  const downloadDir = path.resolve(outDir, 'download');
  const files = await getNamesOfFilesInDir(downloadDir, false);
  return res.status(200).json({
    files,
  });
});


/**
 * @api {get} /logs get all logs
 * @apiName getAllNameOfLogs
 * @apiGroup OutFiles
 * 
 * @apiSuccess {Array<String>} array of name of logs file
 *
 */
router.get('/logs', async (req, res) => {
  const logsDir = path.resolve(outDir, 'logs');
  const files = await getNamesOfFilesInDir(logsDir, false);
  return res.status(200).json({
    files,
  });
});

/**
 * @api {get} /logs/:name get content of download file by name
 * @apiName getContentOfLogByName
 * @apiGroup OutFiles
 *
 * @apiParam (PARAMS) {String} name name of file
 * 
 * @apiSuccess {String} Content of logs file
 * 
 * @apiError 400 name of snapshot file expected
 * @apiError 404 file doesn't exist
 */
router.get('/logs/:name', async (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ message: 'name of log file expected' });
  }
  const file = path.resolve(outDir, 'logs', name);
  const ifFileExist =  await fs.pathExists(path.resolve(file));
  if (!ifFileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  const contentFile = await fs.readFile(file, 'utf8');
  const contentFileParsed = JSON.parse(contentFile);
  return res.status(200).json({
    ...contentFileParsed,
  });
});

module.exports = router;
