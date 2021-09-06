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
  checkStatus,
} = require('../middlewares/status');

const {
  checkAuth,
} = require('../middlewares/auth');

/**
 *
 * @apiParam BODY index - name of the index to which the data will be saved
 * @apiParam BODY startDate - start date at format YYYY-mm-dd
 * @apiParam BODY endDate - end date at format YYYY-mm-dd
 * @apiParam BODY filename - filename of a file found in ezunpaywall
 * @apiParam BODY offset - first line insertion, by default, we start with the first
 * @apiParam BODY limit - last line insertion by default, we have no limit
 *
 * @apiHeader HEADER X-API-KEY - admin apikey
 *
 * @apiSuccess message informing the start of the process
 *
 * @apiError 400 start date is missing
 * @apiError 400 end date is lower than start date
 * @apiError 400 start date or end are date in bad format, dates in format YYYY-mm-dd
 * @apiError 400 filename is in bad format (accepted [a-zA-Z0-9_.-] patern)
 * @apiError 400 limit can't be lower than offset or 0
 * @apiError 404 File not found
 *
 */
router.post('/job', checkStatus, checkAuth, async (req, res) => {
  let {
    index, startDate, endDate, offset, limit,
  } = req.body;

  const { filename } = req.body;

  if (!index) {
    index = 'unpaywall';
  }

  if (filename) {
    const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
    if (!pattern.test(filename)) {
      return res.status(400).json({ message: 'Only ".gz" files are accepted' });
    }
    const fileExist = await fs.pathExists(path.resolve(snapshotsDir, filename));
    if (!fileExist) {
      return res.status(404).json({ message: 'File not found' });
    }
    if (Number(limit) <= Number(offset)) {
      return res.status(400).json({ message: 'Limit cannot be low than offset or 0' });
    }

    if (!offset) { offset = 0; }
    if (!limit) { limit = -1; }

    insertion(filename, index, Number(offset), Number(limit));

    return res.status(200).json({ message: `Update with ${filename}` });
  }

  if (!startDate && !endDate) {
    endDate = Date.now();
    startDate = endDate - (7 * 24 * 60 * 60 * 1000);
    insertSnapshotBetweenDates(url, startDate, endDate, index);
    return res.status(200).json({ message: 'Weekly update started' });
  }

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the futur' });
  }

  if (endDate && !startDate) {
    return res.status(400).json({ message: 'startDate is missing' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;

  if (startDate && !pattern.test(startDate)) {
    return res.status(400).json({ message: 'startDate are in wrong format, required YYYY-mm-dd' });
  }

  if (endDate && !pattern.test(endDate)) {
    return res.status(400).json({ message: 'endDate are in wrong format, required YYYY-mm-dd' });
  }

  if (startDate && !endDate) {
    [endDate] = new Date().toISOString().split('T');
  }

  insertSnapshotBetweenDates(url, startDate, endDate, index);

  return res.status(200).json({
    message: `Dowload and insert snapshot from unpaywall from ${startDate} and ${endDate}`,
  });
});

module.exports = router;
