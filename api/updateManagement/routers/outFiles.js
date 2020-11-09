const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');
const express = require('express');

const outDir = path.resolve(__dirname, '..', '..', 'out');
const { getNamesOfFilesInDir } = require('../services/accessToOutFiles');

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
  if (latest) {
    const contentFile = await fs.readFile(path.resolve(reportDir, files), 'utf-8');
    const contentFileParsed = JSON.parse(contentFile);
    return res.status(200).json({
      ...contentFileParsed,
    });
  }
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
// access to file in out
router.use('/reports', express.static(path.resolve(outDir, 'reports')));
router.use('/logs', express.static(path.resolve(outDir, 'logs')));

module.exports = router;
