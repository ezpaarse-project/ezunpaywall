const router = require('express').Router();

const {
  insertWithOaHistory,
  historyRollBack,
} = require('../controllers/job');

const {
  step1,
  step2,
  step3,
} = require('../history');

const {
  validateHistoryJob,
  validateHistoryReset,
} = require('../../middlewares/format/job');

const checkStatus = require('../../middlewares/status');
const checkAuth = require('../../middlewares/auth');

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/history/job', checkStatus, checkAuth, validateHistoryJob, insertWithOaHistory);

/**
 * Route that roll back the current and the history index according to a date.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/history/job/reset', checkStatus, checkAuth, validateHistoryReset, historyRollBack);

/**
 * Route that roll back the current and the history index according to a date.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/history/job/reset', checkStatus, checkAuth, validateHistoryReset, historyRollBack);

router.post('/history/job/reset/step1', checkStatus, checkAuth, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step1(startDate);
  return res.status(202).json();
});

router.post('/history/job/reset/step2', checkStatus, checkAuth, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step2(startDate);
  return res.status(202).json();
});

router.post('/job/history/reset/step3', checkStatus, checkAuth, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step3(startDate);
  return res.status(202).json();
});

module.exports = router;
