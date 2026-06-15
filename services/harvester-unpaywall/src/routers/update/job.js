const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { paths } = require('config');

const router = require('express').Router();

const {
  validateSnapshotJob,
  validateJobChangefilesConfig,
  validateInsertFile,
} = require('../../middlewares/format/job');

const checkStatus = require('../../middlewares/status');
const checkAdmin = require('../../middlewares/admin');

const {
  downloadSnapshotProcess,
  downloadInsertSnapshotProcess,
  downloadInsertChangefilesProcess,
  insertFileProcess,
} = require('../../lib/update');

/**
 * Route that download the current snapshot of unpaywall.
 * Auth required.
 * No update process should be in progress.
 */
router.post('/job/snapshots/download', checkStatus, checkAdmin, async (req, res, next) => {
  const { mail } = req.body;
  downloadSnapshotProcess(mail ?? true);
  return res.status(202).json();
});

/**
 * Route that download the current snapshot of unpaywall and insert his content.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/snapshots/download/insert', checkStatus, checkAdmin, validateSnapshotJob, async (req, res, next) => {
  const { index } = req.data;
  let { mail } = req.data;

  mail = mail ?? true;

  const jobConfig = {
    type: 'snapshot',
    index,
    offset: 0,
    limit: -1,
    mail,
  };

  downloadInsertSnapshotProcess(jobConfig);
  return res.status(202).json();
});

/**
 * Route that insert on elastic the content of snapshot installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/snapshots/insert/:filename', checkStatus, checkAdmin, validateInsertFile, async (req, res, next) => {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;

  if (!await fs.existsSync(path.resolve(paths.data.snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'snapshot';

  insertFileProcess(jobConfig);

  return res.status(202).json();
});

/**
 * Route that download and insert on elastic the changefiles from unpaywall between a period.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job.
 */
router.post('/job/changefiles/download/insert', checkStatus, checkAdmin, validateJobChangefilesConfig, async (req, res, next) => {
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

    downloadInsertChangefilesProcess(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  downloadInsertChangefilesProcess(jobConfig);
  return res.status(202).json();
});

/**
 * Route that insert on elastic the content of changefile installed on ezunpaywall.
 * Auth required.
 * No update process should be in progress.
 *
 * This route need a body that contains a config of job
 * and a param which corresponds to the filename.
 */
router.post('/job/changefiles/insert/:filename', checkStatus, checkAdmin, validateInsertFile, async (req, res, next) => {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;
  if (!await fs.existsSync(path.resolve(paths.data.changefilesDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'changefile';

  insertFileProcess(jobConfig);

  return res.status(202).json();
});

module.exports = router;
