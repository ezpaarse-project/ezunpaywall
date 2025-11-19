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

const checkStatus = require('../../middlewares/status');
const checkAdmin = require('../../middlewares/admin');

/**
 * Route that download the current snapshot of unpaywall.
 * Auth required.
 * No update process should be in progress.
 */
router.post('/job/snapshots/download', checkStatus, checkAdmin, downloadSnapshotJobController);

/**
 * Route that download the current snapshot of unpaywall and insert his content.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/snapshots/download/insert', checkStatus, checkAdmin, validateSnapshotJob, downloadAndInsertSnapshotJobController);

/**
 * Route that insert on elastic the content of snapshot installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/snapshots/insert/:filename', checkStatus, checkAdmin, validateInsertFile, insertSnapshotJobController);

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/changefiles/download/insert', checkStatus, checkAdmin, validateJobChangefilesConfig, insertChangefilesOnPeriodJobController);

/**
 * Route that insert on elastic the content of changefile installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/changefiles/insert/:filename', checkStatus, checkAdmin, validateInsertFile, insertChangefileJobController);

module.exports = router;
