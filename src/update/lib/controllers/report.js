const path = require('path');
const fs = require('fs-extra');

const { getMostRecentFile } = require('../file');
const { getReport } = require('../report');
const { getPathOfDirectory } = require('../file');

/**
 * Controller to get list of reports or latest report.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getReports(req, res, next) {
  const { latest, type } = req.data;

  const pathOfDirectory = getPathOfDirectory(type, 'reports');

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(pathOfDirectory);
    } catch (err) {
      return next({ message: err.message });
    }

    if (!latestFile) {
      return next({ message: 'No reports are available' });
    }

    let report;
    try {
      report = await getReport(type, latestFile?.filename);
    } catch (err) {
      return next({ message: `Cannot get [${latestFile?.filename}] latest report` });
    }
    return res.status(200).json(report);
  }

  let reports = await fs.readdir(pathOfDirectory);

  reports = reports.sort((a, b) => {
    const [date1] = a.split('.');
    const [date2] = b.split('.');
    return new Date(date2).getTime() - new Date(date1).getTime();
  });

  return res.status(200).json(reports);
}

/**
 * Controller to get report by filename.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function getReportByFilename(req, res, next) {
  const { filename, type } = req.data;

  const pathOfDirectory = getPathOfDirectory(type, 'reports');

  try {
    await fs.stat(path.resolve(pathOfDirectory, filename));
  } catch (err) {
    return next({ message: `File [${filename}] not found` });
  }

  let report;
  try {
    report = await getReport(type, filename);
  } catch (err) {
    return next({ message: `Cannot get ${filename} report` });
  }
  return res.status(200).json(report);
}

module.exports = {
  getReports,
  getReportByFilename,
};
