const router = require('express').Router();

const {
  downloadSnapshotJobController,
  downloadAndInsertSnapshotJobController,
  insertChangefilesOnPeriodJobController,
  insertChangefileJobController,
  insertSnapshotJobController,
} = require('../../controllers/update/job');

const {
  validateSnapshotJob,
  validateJobChangefilesConfig,
  validateInsertFile,
} = require('../../middlewares/format/job');

const { insertWithOaHistoryController, historyRollBackController } = require('../../controllers/update/job');

const { step1, step2, step3 } = require('../../lib/update/history');

const { validateHistoryJob, validateHistoryReset } = require('../../middlewares/format/job');

const checkStatus = require('../../middlewares/status');
const checkAdmin = require('../../middlewares/admin');

/**
 * Route that download the current snapshot of unpaywall.
 * Auth required.
 * No update process should be in progress.
 */
router.post('/job/snapshot/download', checkStatus, checkAdmin, downloadSnapshotJobController);

/**
 * Route that download the current snapshot of unpaywall and insert his content.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/snapshot/download/insert', checkStatus, checkAdmin, validateSnapshotJob, downloadAndInsertSnapshotJobController);

/**
 * Route that insert on elastic the content of snapshot installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/snapshot/insert/:filename', checkStatus, checkAdmin, validateInsertFile, insertSnapshotJobController);

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/changefile/download/insert', checkStatus, checkAdmin, validateJobChangefilesConfig, insertChangefilesOnPeriodJobController);

/**
 * Route that insert on elastic the content of changefile installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/changefile/insert/:filename', checkStatus, checkAdmin, validateInsertFile, insertChangefileJobController);

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period
 * and feed the history.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/changefile/history/download/insert', checkStatus, checkAdmin, validateHistoryJob, insertWithOaHistoryController);

/**
 * Route that insert on elastic the content of file changefile on ezunpaywall
 * and feed the history.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/changefile/history/insert/:filename', checkStatus, checkAdmin, validateInsertFile, insertChangefileJobController);

/**
 * Route that roll back the current and the history index according to a date.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/history/reset', checkStatus, checkAdmin, validateHistoryReset, historyRollBackController);

// Dev
router.post('/job/history/reset/step1', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step1(startDate);
  return res.status(202).json();
});

router.post('/job/history/reset/step2', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step2(startDate);
  return res.status(202).json();
});

router.post('/job/history/reset/step3', checkStatus, checkAdmin, validateHistoryReset, async (req, res, next) => {
  const { startDate } = req.data;

  await step3(startDate);
  return res.status(202).json();
});

module.exports = router;
