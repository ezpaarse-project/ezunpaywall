const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { paths } = require('config');

const router = require('express').Router();

const { getMostRecentFile } = require('../../lib/files');
const { getReport } = require('../../lib/update/report');

const validateLatest = require('../../middlewares/format/latest');
const validateFilename = require('../../middlewares/format/filename');
const { validateQueryType } = require('../../middlewares/format/type');

/**
 * Route that give the list of reports or the content of most recent report in JSON format.
 *
 * This route can take in query latest and type.
 */
router.get('/reports', validateQueryType, validateLatest, async (req, res, next) => {
  const { latest, type } = req.data;

  if (latest) {
    let latestFile;
    try {
      latestFile = await getMostRecentFile(paths.data.reportsDir);
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

  let reports = await fsp.readdir(paths.data.reportsDir);

  reports = reports.sort((a, b) => {
    const [date1] = a.split('_');
    const [date2] = b.split('_');
    return new Date(date2).getTime() - new Date(date1).getTime();
  });

  if (type) {
    reports = reports.filter((report) => report.includes(`${type}`));
  }

  return res.status(200).json(reports);
});

/**
 * Route that give the content of report in JSON format.
 *
 * This route takes a param which corresponds to the filename of report.
 */
router.get('/reports/:filename', validateFilename, async (req, res, next) => {
  const { filename } = req.data;

  try {
    await fs.existsSync(path.resolve(paths.data.reportsDir, filename));
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
});

module.exports = router;
