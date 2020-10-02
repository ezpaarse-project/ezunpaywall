const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');

const {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
} = require('../services/unpaywall');

const {
  tasks,
} = require('../services/status');

// middleware
router.use((req, res, next) => {
  if (tasks.currentTask) {
    return res.status(409).json({
      message: 'process in progress, check /insert/status',
    });
  }
  return next();
});

/**
 * Insert the content of files that the
 * server has already downloaded (file in .gz format).
 * offset and limit are the variables to designate
 * from which line to insert and from which line to stop.
 *
 * @api {post} /update/:name insert the content of files that the server has already downloaded
 * @apiName Update
 * @apiGroup updateManagement
 *
 * @apiParam (QUERY) {Number} [offset] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit] last line insertion by default, we have no limit
 * @apiParam (PARAMS) {String} name name of file
 *
 * @apiSuccess {String} message informing the start of the process
 *
 * @apiError 400 name of snapshot file expected /
 * name of file is in bad format (accepted [a-zA-Z0-9_.-] patern) /
 * limit can't be lower than offset or 0
 * @apiError 404 file doesn\'t exist
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
    return res.status(400).json({ message: 'name of file is in bad format (accepted [a-zA-Z0-9_.-] patern)' });
  }
  const ifFileExist = await fs.pathExists(path.resolve(__dirname, '..', '..', 'out', 'download', file));
  if (!ifFileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  if (limit < offset) {
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
 * @api {post} /update downloads update files offered by unpaywall.
 * @apiName Fetch-Download-Update
 * @apiGroup updateManagement
 *
 * @apiParam (QUERY) {DATE} [startDate] period start date at format YYYY-mm-dd
 * @apiParam (QUERY) {DATE} [endDate] period end date at format YYYY-mm-dd
 *
 * @apiSuccess {String} message informing the start of the process
 *
 * @apiError 400 end date is lower than start date /
 * start date or end are date in bad format, dates in format YYYY-mm-dd
 */
router.post('/update', (req, res) => {
  const { startDate } = req.query;
  let { endDate } = req.query;
  if (!startDate && !endDate) {
    weeklyUpdate();
    return res.status(200).json({
      message: 'weekly update has begun, list of tasks has been created on elastic',
    });
  }
  if (endDate && !startDate) {
    return res.status(400).json({
      message: 'start date is missing',
    });
  }
  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'end date is lower than start date' });
    }
  }
  const pattern = /^[0-9]*-[0-9]{2}-[0-9]{2}$/;
  // TODO date avaible, like 2020-99-99 impossible
  if (startDate && !pattern.test(startDate)) {
    return res.status(400).json({ message: 'start date or end date are in bad format, dates in format YYYY-mm-dd' });
  }
  if (endDate && !pattern.test(endDate)) {
    return res.status(400).json({ message: 'start date or end date are in bad format, dates in format YYYY-mm-dd' });
  }
  if (startDate && !endDate) {
    [endDate] = new Date().toISOString().split('T');
  }
  console.log(endDate);
  insertSnapshotBetweenDate(startDate, endDate);
  return res.status(200).json({
    message: `insert snapshot beetween ${startDate} and ${endDate} has begun, list of tasks has been created on elastic'`,
  });
});

module.exports = router;
