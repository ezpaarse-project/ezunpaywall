const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');
const { paths } = require('config');

const {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
  insertWithOaHistoryJob,
} = require('../job');

const {
  rollBack,
} = require('../history');

/**
 * Controller to start job that download and insert snapshot.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function downloadAndInsertSnapshotJob(req, res, next) {
  const { index } = req.data;

  const jobConfig = {
    type: 'snapshot',
    index,
    offset: 0,
    limit: -1,
  };

  downloadAndInsertSnapshot(jobConfig);
  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function insertChangefilesOnPeriodJob(req, res, next) {
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

    insertChangefilesOnPeriod(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  insertChangefilesOnPeriod(jobConfig);
  return res.status(202).json();
}

/**
 * Controller to start job that insert changefile already installed.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function insertChangefileJob(req, res, next) {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;
  if (!await fs.pathExists(path.resolve(paths.data.changefilesDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'changefile';

  insertChangefile(jobConfig);

  return res.status(202).json();
}

/**
 * Controller to start job that insert snapshot already installed.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function insertSnapshotJob(req, res, next) {
  const { jobConfig } = req.data;

  const { filename } = jobConfig;

  if (!await fs.pathExists(path.resolve(paths.data.snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  jobConfig.type = 'snapshot';

  insertChangefile(jobConfig);

  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function insertWithOaHistory(req, res, next) {
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

    insertWithOaHistoryJob(jobConfig);
    return res.status(202).json();
  }

  if (startDate && !endDate) jobConfig.endDate = format(new Date(), 'yyyy-MM-dd');

  insertWithOaHistoryJob(jobConfig);
  return res.status(202).json();
}

/**
 * Controller to start job that download ans insert changefiles on period.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function historyRollBack(req, res, next) {
  const { startDate, indexBase, indexHistory } = req.data.rollBackConfig;

  await rollBack(startDate, indexBase, indexHistory);
  return res.status(202).json();
}

module.exports = {
  downloadAndInsertSnapshotJob,
  insertChangefilesOnPeriodJob,
  insertChangefileJob,
  insertSnapshotJob,
  insertWithOaHistory,
  historyRollBack,
};
