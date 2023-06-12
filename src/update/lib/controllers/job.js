const fs = require('fs-extra');
const path = require('path');
const { format } = require('date-fns');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

const {
  downloadAndInsertSnapshot,
  insertChangefilesOnPeriod,
  insertChangefile,
} = require('../job');

async function downloadAndInsertSnapshotJob(req, res, next) {
  const index = req.data;

  const jobConfig = {
    index,
    offset: 0,
    limit: -1,
  };

  downloadAndInsertSnapshot(jobConfig);
  return res.status(202).json();
}

async function insertChangefilesOnPeriodJob(req, res, next) {
  const {
    startDate,
    endDate,
    index,
    interval,
  } = req.data;

  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate cannot be in the futur' });
  }

  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate cannot be lower than startDate' });
    }
  }

  const jobConfig = {
    index,
    interval,
    startDate,
    endDate,
    offset: 0,
    limit: -1,
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
}

async function insertChangefileJob(req, res, next) {
  const {
    filename, index, offset, limit,
  } = req.data;

  if (!await fs.pathExists(path.resolve(snapshotsDir, filename))) {
    return res.status(404).json({ message: `File [${filename}] not found` });
  }

  const jobConfig = {
    filename,
    index,
    offset,
    limit,
  };

  insertChangefile(jobConfig);

  return res.status(202).json();
}

module.exports = {
  downloadAndInsertSnapshotJob,
  insertChangefilesOnPeriodJob,
  insertChangefileJob,
};
