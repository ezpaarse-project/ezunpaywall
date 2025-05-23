const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const { paths } = require('config');

const {
  downloadSnapshotProcess,
  downloadInsertSnapshotProcess,
  downloadInsertChangefilesProcess,
  insertFileProcess,
  downloadInsertChangefilesHistoryProcess,
} = require('../../lib/update');

const { rollBack } = require('../../lib/update/history');

/**
 * Controller to start job that download snapshot.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function downloadSnapshotJobController(req, res, next) {
  downloadSnapshotProcess();
  return res.status(202).json();
}

/**
 * Controller to start job that download and insert snapshot.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function downloadAndInsertSnapshotJobController(req, res, next) {
  const { index } = req.data;

  const jobConfig = {
    type: 'snapshot',
    index,
    offset: 0,
    limit: -1,
  };

  downloadInsertSnapshotProcess(jobConfig);
  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function insertChangefilesOnPeriodJobController(req, res, next) {
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
}

/**
 * Controller to start job that insert changefile already installed.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function insertChangefileJobController(req, res, next) {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;
  if (!await fs.existsSync(path.resolve(paths.data.changefilesDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'changefile';

  insertFileProcess(jobConfig);

  return res.status(202).json();
}

/**
 * Controller to start job that insert snapshot already installed.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function insertSnapshotJobController(req, res, next) {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;

  if (!await fs.existsSync(path.resolve(paths.data.snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'snapshot';

  insertFileProcess(jobConfig);

  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function insertWithOaHistoryController(req, res, next) {
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
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function historyRollBackController(req, res, next) {
  const { startDate, index, indexHistory } = req.data.rollBackConfig;

  await rollBack(startDate, index, indexHistory);
  return res.status(202).json();
}

module.exports = {
  downloadSnapshotJobController,
  downloadAndInsertSnapshotJobController,
  insertChangefilesOnPeriodJobController,
  insertChangefileJobController,
  insertSnapshotJobController,
  insertWithOaHistoryController,
  historyRollBackController,
};
