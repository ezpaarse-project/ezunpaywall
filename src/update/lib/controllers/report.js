const path = require('path');
const fs = require('fs-extra');

const { getMostRecentFile } = require('../file');
const { getReport } = require('../report');

const reportsDir = path.resolve(__dirname, '..', '..', 'data', 'reports');

async function getReports(req, res, next) {
  const latest = req.data;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(reportsDir);
    } catch (err) {
      return next({ message: err.message });
    }

    if (!latestFile) {
      return next({ message: 'No reports are available' });
    }

    let report;
    try {
      report = await getReport(latestFile?.filename);
    } catch (err) {
      return next({ message: `Cannot get [${latestFile?.filename}] latest report` });
    }
    return res.status(200).json(report);
  }

  let reports = await fs.readdir(reportsDir);

  reports = reports.sort((a, b) => {
    const [date1] = a.split('.');
    const [date2] = b.split('.');
    return new Date(date2).getTime() - new Date(date1).getTime();
  });

  return res.status(200).json(reports);
}

async function getReportByFilename(req, res, next) {
  const filename = req.data;

  try {
    await fs.stat(path.resolve(reportsDir, filename));
  } catch (err) {
    return next({ message: `File [${filename}] not found` });
  }

  let report;
  try {
    report = await getReport(filename);
  } catch (err) {
    return next({ message: `Cannot get ${filename} report` });
  }
  return res.status(200).json(report);
}

module.exports = {
  getReports,
  getReportByFilename,
};
