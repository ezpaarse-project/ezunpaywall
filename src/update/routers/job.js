const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const boom = require('@hapi/boom');
const joi = require('joi').extend(require('@hapi/joi-date'));
const { format } = require('date-fns');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
} = require('../bin/job');

const { createState } = require('../bin/state');

const {
  checkStatus,
} = require('../middlewares/status');

const {
  checkAuth,
} = require('../middlewares/auth');

router.post('/job/snapshot', checkStatus, checkAuth, async (req, res, next) => {
  const { error, value } = joi.string().trim().default('unpaywall').validate(req.body.index);

  if (error) return next(boom.badRequest(error.details[0].message));

  const index = value;

  const stateName = await createState();

  const jobConfig = {
    index,
    offset: 0,
    limit: -1,
    stateName,
  };

  downloadAndInsertSnapshot(jobConfig);
  return res.status(202).json();
});

router.post('/job/period', checkStatus, checkAuth, async (req, res, next) => {
  const { error, value } = joi.object({
    index: joi.string().trim().default('unpaywall'),
    interval: joi.string().trim().valid('day', 'week').default('day'),
    startDate: joi.date().format('YYYY-MM-DD'),
    endDate: joi.date().format('YYYY-MM-DD').min(joi.ref('startDate')),
  }).with('endDate', 'startDate').validate(req.body);

  if (error) return next(boom.badRequest(error.details[0].message));

  const {
    startDate,
    endDate,
    index,
    interval,
  } = value;

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the futur' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  const stateName = await createState();

  const jobConfig = {
    index,
    interval,
    startDate,
    endDate,
    stateName,
    offset: 0,
    litmit: -1,
  };

  if (!startDate && !endDate) {
    jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');
    if (interval === 'week') jobConfig.startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    if (interval === 'day') jobConfig.startDate = format(new Date(), 'yyyy-MM-dd');

    insertChangefilesOnPeriod(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  insertChangefilesOnPeriod(jobConfig);
  return res.status(202).json();
});

router.post('/job/changefile/:filename', checkStatus, checkAuth, async (req, res, next) => {
  const { filename } = req.params;

  const snapshotPattern = /^[a-zA-Z0-9_.-]+(.gz)$/;

  const { error } = joi.string().trim().regex(snapshotPattern).required()
    .validate(filename);

  if (error) return next(boom.badRequest(error.details[0].message));

  const checkBody = joi.object({
    index: joi.string().trim().default('unpaywall'),
    offset: joi.number().greater(-1).default(0),
    limit: joi.number().greater(joi.ref('offset')).default(-1),
  }).validate(req.body);

  if (checkBody.error) return next(boom.badRequest(checkBody.error.details[0].message));

  const { index, offset, limit } = checkBody.value;

  if (!await fs.pathExists(path.resolve(snapshotsDir, filename))) {
    return next(boom.notFound(`${filename} not found`));
  }

  const stateName = await createState();

  const jobConfig = {
    filename,
    index,
    offset,
    limit,
    stateName,
  };

  insertChangefile(jobConfig);

  return res.status(202).json();
});

module.exports = router;
