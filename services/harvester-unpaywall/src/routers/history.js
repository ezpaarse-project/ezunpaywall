const router = require('express').Router();
const { format } = require('date-fns');

const downloadInsertChangefilesHistoryProcess = require('../lib/history');
const { rollBack } = require('../lib/history/job');
const { step1, step2, step3 } = require('../lib/history/job');

const { validateHistoryJob, validateHistoryReset } = require('../middlewares/format/job');

const checkStatus = require('../middlewares/status');
const checkAdmin = require('../middlewares/admin');

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period
 * and feed the history.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/changefiles/history/download/insert', checkStatus, checkAdmin, validateHistoryJob, async (req, res, next) => {
  const { jobConfig } = req.data;

  const {
    startDate,
    endDate,
    interval,
  } = jobConfig;

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the future' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  jobConfig.type = 'changefile';
  jobConfig.offset = 0;
  jobConfig.limit = -1;

  if (!startDate && !endDate) {
    jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');
    if (interval === 'week') jobConfig.startDate = format(new Date() - (7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    if (interval === 'day') jobConfig.startDate = format(new Date(), 'yyyy-MM-dd');

    downloadInsertChangefilesHistoryProcess(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  downloadInsertChangefilesHistoryProcess(jobConfig);
  return res.status(202).json();
});

/**
 * Route that roll back the current and the history index according to a date.
 * Auth required.
 * No update process should be in progress.
 *
 * Not used
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/history/reset', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate, index, indexHistory } = req.data.rollBackConfig;

  await rollBack(startDate, index, indexHistory);
  return res.status(202).json();
});

/**
 * Not used
 */
router.post('/job/history/reset/step1', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step1(startDate);
  return res.status(202).json();
});

/**
 * Not used
 */
router.post('/job/history/reset/step2', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step2(startDate);
  return res.status(202).json();
});

/**
 * Not used
 */
router.post('/job/history/reset/step3', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step3(startDate);
  return res.status(202).json();
});

module.exports = router;
