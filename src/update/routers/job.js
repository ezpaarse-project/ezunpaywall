const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const url = `${config.get('unpaywallURL')}?api_key=${config.get('apikeyupw')}`;

const {
  insertion,
  insertSnapshotBetweenDates,
} = require('../bin/update');

const {
  checkAdmin,
} = require('../middlewares/admin');

const {
  checkStatus,
} = require('../middlewares/status');

/**
 * Insert the content of files that the
 * server has already downloaded (file in .gz format).
 * offset and limit are the variables to designate
 * from which line to insert and from which line to stop.
 *
 * @apiParam QUERRY offset - first line insertion, by default, we start with the first
 * @apiParam QUERRY limit - last line insertion by default, we have no limit
 * @apiParam QUERRY index - name of the index to which the data will be saved
 * @apiParam PARAMS filename - filename
 *
 * @apiHeader HEADER X-API-KEY - filename
 *
 * @apiSuccess {string} message informing the start of the process
 *
 * @apiError 400 name of snapshot file expected
 * @apiError 400 filename is in bad format (accepted [a-zA-Z0-9_.-] patern)
 * @apiError 400 limit can't be lower than offset or 0
 * @apiError 404 file not found
 *
 */
router.post('/update/:filename', checkStatus, checkAdmin, async (req, res) => {
  const { filename } = req.params;
  let { offset, limit, index } = req.query;
  if (!index) {
    index = 'unpaywall';
  }
  if (!filename) {
    return res.status(400).json({ message: 'filename of snapshot file expected' });
  }
  const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
  if (!pattern.test(filename)) {
    return res.status(400).json({ message: 'filename of file is in bad format (accepted a .gz file)' });
  }
  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  if (Number(limit) <= Number(offset)) {
    return res.status(400).json({ message: 'limit can\t be lower than offset or 0' });
  }

  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }

  insertion(filename, index, { offset: Number(offset), limit: Number(limit) });

  return res.status(200).json({
    message: `start upsert with ${filename}`,
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
 * @apiParam QUERY startDate - start date at format YYYY-mm-dd
 * @apiParam QUERY endDate - end date at format YYYY-mm-dd
 * @apiParam QUERRY index - name of the index to which the data will be saved
 *
 * @apiSuccess message informing the start of the process
 *
 * @apiError 400 start date is missing
 * @apiError 400 end date is lower than start date
 * @apiError 400 start date or end are date in bad format, dates in format YYYY-mm-dd
 */
router.post('/update', checkStatus, checkAdmin, (req, res) => {
  let { startDate, endDate, index } = req.query;

  if (!index) {
    index = 'unpaywall';
  }

  if (!startDate && !endDate) {
    endDate = Date.now();
    startDate = endDate - (7 * 24 * 60 * 60 * 1000);
    insertSnapshotBetweenDates(url, startDate, endDate, index);
    return res.status(200).json({
      message: 'weekly update started',
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

  insertSnapshotBetweenDates(url, startDate, endDate, index);

  return res.status(200).json({
    message: `insert snapshot beetween ${startDate} and ${endDate} has begun, list of task has been created on elastic`,
  });
});

module.exports = router;
