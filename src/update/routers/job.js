const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const boom = require('@hapi/boom');
const joi = require('joi').extend(require('@hapi/joi-date'));
const { format } = require('date-fns');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const {
  insertion,
  insertSnapshotBetweenDates,
  insertBigSnapshot,
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
 * @apiParam BODY interval - interval of snapshot update, day or week
 * @apiParam BODY startDate - start date at format YYYY-mm-dd
 * @apiParam BODY endDate - end date at format YYYY-mm-dd
 * @apiParam BODY filename - filename of a file found in ezunpaywall
 * @apiParam BODY offset - first line insertion, by default, we start with the first
 * @apiParam BODY limit - last line insertion by default, we have no limit
 *
 * @apiHeader HEADER x-api-key - admin apikey
 *
 * @return message informing the start of the process
 *
 */
router.post('/job', checkStatus, checkAuth, async (req, res, next) => {
  const snapshotPattern = /^[a-zA-Z0-9_.-]+(.gz)$/;

  const schema = joi.object({
    index: joi.string().trim().default('unpaywall'),
    offset: joi.number().greater(-1).default(0),
    limit: joi.number().greater(joi.ref('offset')).default(-1),
    interval: joi.string().trim().valid('day', 'week').default('day'),
    filename: joi.string().trim().regex(snapshotPattern),
    startDate: joi.date().format('YYYY-MM-DD'),
    endDate: joi.date().format('YYYY-MM-DD').min(joi.ref('startDate')),
    snapshot: joi.boolean(),
  }).with('endDate', 'startDate');

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(boom.badRequest(error.details[0].message));
  }

  let { startDate, endDate } = value;

  const {
    index, offset, limit, interval, filename, snapshot,
  } = value;

  if (startDate) startDate = format(new Date(startDate), 'yyyy-MM-dd');
  if (endDate) endDate = format(new Date(endDate), 'yyyy-MM-dd');

  const jobConfig = {};

  jobConfig.index = index;

  if (filename) {
    try {
      await fs.stat(path.resolve(snapshotsDir, filename));
    } catch (err) {
      return next(boom.notFound('File not found'));
    }

    jobConfig.filename = filename;
    jobConfig.offset = offset;
    jobConfig.limit = limit;
    insertion(jobConfig);

    return res.status(200).json({ message: `Update with ${filename}` });
  }

  if (snapshot) {
    insertBigSnapshot(jobConfig);
    return res.status(200).json({ message: 'Big update started' });
  }

  jobConfig.interval = interval;
  jobConfig.startDate = startDate;
  jobConfig.endDate = endDate;

  // if no dates are send, do weekly / daily update
  if (!startDate && !endDate) {
    jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');
    if (interval === 'week') {
      jobConfig.startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      insertSnapshotBetweenDates(jobConfig);
      return res.status(200).json({ message: 'Weekly update started' });
    }
    if (interval === 'day') {
      jobConfig.startDate = format(new Date(), 'yyyy-MM-dd');
      insertSnapshotBetweenDates(jobConfig);
      return res.status(200).json({ message: 'Daily update started' });
    }
  }

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the futur' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  insertSnapshotBetweenDates(jobConfig);

  return res.status(200).json({
    message: `Download and insert snapshot from unpaywall from ${jobConfig.startDate} and ${jobConfig.endDate}`,
  });
});

module.exports = router;
