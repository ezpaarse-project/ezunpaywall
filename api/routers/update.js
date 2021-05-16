const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const url = `${config.get('unpaywallURL')}?api_key=${config.get('apikey')}`;

const updateDir = path.resolve(__dirname, '..', 'out', 'update', 'download');
const stateDir = path.resolve(__dirname, '..', 'out', 'update', 'state');
const reportDir = path.resolve(__dirname, '..', 'out', 'update', 'report');

const {
  insertion,
  insertSnapshotBetweenDates,
} = require('../services/update/utils');

const {
  getStatus,
} = require('../services/update/status');

const {
  getState,
} = require('../services/update/state');

const {
  getReport,
} = require('../services/update/report');

/**
 * get the files in a dir in order by date
 * @param {string} dir - dir path
 * @returns {array<string>} files path in order
 */
const orderReccentFiles = (dir) => fs.readdirSync(dir)
  .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
  .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

/**
 * get the most recent file in a dir
 * @param {string} dir - dir path
 * @returns {string} most recent file path
 */
const getMostRecentFile = async (dir) => {
  const files = await orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

// middleware
// router.use((req, res, next) => {
//   return res.status(409).json({
//     message: 'process in progress, check /insert/status',
//   });
//   return next();
// });

/**
 * Insert the content of files that the
 * server has already downloaded (file in .gz format).
 * offset and limit are the variables to designate
 * from which line to insert and from which line to stop.
 *
 * @api {post} /update/:name insert the content of files that the server has already downloaded
 * @apiName Update
 * @apiGroup Update
 *
 * @apiParam (QUERY) {Number} [offset] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit] last line insertion by default, we have no limit
 * @apiParam (PARAMS) {string} name name of file
 *
 * @apiSuccess {string} message informing the start of the process
 *
 * @apiError 400 name of snapshot file expected /
 * name of file is in bad format (accepted [a-zA-Z0-9_.-] patern) /
 * limit can't be lower than offset or 0
 * @apiError 404 file doesn't exist
 *
 */
router.post('/update/:name', async (req, res) => {
  const { name } = req.params;
  let { offset, limit } = req.query;
  if (!name) {
    return res.status(400).json({ message: 'name of snapshot file expected' });
  }
  const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
  if (!pattern.test(name)) {
    return res.status(400).json({ message: 'name of file is in bad format (accepted a .gz file)' });
  }
  const fileExist = await fs.pathExists(path.resolve(updateDir, name));
  if (!fileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  if (Number(limit) <= Number(offset)) {
    return res.status(400).json({ message: 'limit can\t be lower than offset or 0' });
  }

  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  insertion(name, { offset: Number(offset), limit: Number(limit) });
  return res.status(200).json({
    message: `start upsert with ${name}`,
  });
});

/**
 *
 * Downloads update files offered by unpaywall.
 * - If there are no `start` and` end` attributes, It will execute
 * the download and the insertion of the most recent update file.
 *
 * - If there are the `start` and` end` attributes, It will execute
 * the download and the insertion of the update files between the given period.
 *
 * - If there is the `start` attribute, It will execute the download and
 * the insertion of the update files between the` start` date and the current date.
 *
 * @apiParam (QUERY) {DATE} [startDate] period start date at format YYYY-mm-dd
 * @apiParam (QUERY) {DATE} [endDate] period end date at format YYYY-mm-dd
 *
 * @apiSuccess {string} message informing the start of the process
 *
 * @apiError 400 start date is missing / end date is lower than start date /
 * start date or end are date in bad format, dates in format YYYY-mm-dd
 */
router.post('/update', (req, res) => {
  let { startDate } = req.query;
  let { endDate } = req.query;
  if (!startDate && !endDate) {
    endDate = Date.now();
    startDate = endDate - (7 * 24 * 60 * 60 * 1000);
    insertSnapshotBetweenDates(url, startDate, endDate);
    return res.status(200).json({
      message: 'weekly update has begun, list of task has been created on elastic',
    });
  }
  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate is in the futur' });
  }

  if (endDate && !startDate) {
    return res.status(400).json({
      message: 'start date is missing',
    });
  }
  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate is lower than startDate' });
    }
  }
  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (startDate && !pattern.test(startDate)) {
    return res.status(400).json({ message: 'startDate are in bad format, date need to be in format YYYY-mm-dd' });
  }
  if (endDate && !pattern.test(endDate)) {
    return res.status(400).json({ message: 'endDate are in bad format, date need to be in format format YYYY-mm-dd' });
  }
  if (startDate && !endDate) {
    [endDate] = new Date().toISOString().split('T');
  }
  insertSnapshotBetweenDates(url, startDate, endDate);
  return res.status(200).json({
    message: `insert snapshot beetween ${startDate} and ${endDate} has begun, list of task has been created on elastic`,
  });
});

/**
 * 
 */
router.get('/update/status', (req, res) => res.status(200).json({ inUpdate: getStatus() }));

router.get('/update/state', async (req, res) => {
  const latestFile = await getMostRecentFile(stateDir);
  const state = await getState(latestFile?.file);
  res.status(200).json({ state });
});

router.get('/update/report', async (req, res) => {
  const latestFile = await getMostRecentFile(reportDir);
  const report = await getReport(latestFile?.file);
  res.status(200).json({ report });
});

module.exports = router;
