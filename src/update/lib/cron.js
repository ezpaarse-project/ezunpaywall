/* eslint-disable no-restricted-syntax */
const { CronJob } = require('cron');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

const reportsDir = path.resolve(__dirname, '..', 'out', 'reports');
const snapshotDir = path.resolve(__dirname, '..', 'out', 'snapshots');
const states = path.resolve(__dirname, '..', 'out', 'states');

const deleteFilesInDir = async (directory, day) => {
  const time = 1 * 24 * 60 * 60 * 1000 * day;
  const yerteday = Date.now() - time;

  let files;
  try {
    files = await fs.readdir(directory);
  } catch (err) {
    logger.error(err);
    return;
  }

  for (const file of files) {
    try {
      const stat = await fs.stat(path.join(directory, file));
      if (stat.mtime < yerteday) {
        await fs.unlink(path.join(directory, file));
      }
    } catch (err) {
      logger.error(err);
      return;
    }
  }
};

const cronDeleteOutFiles = new CronJob('0 0 0 * * *', async () => {
  await deleteFilesInDir(reportsDir, 30);
  logger.info('Delete reports files');

  await deleteFilesInDir(snapshotDir, 30);
  logger.info('Delete snapshots files');

  await deleteFilesInDir(states, 1);
  logger.info('Delete states files');
}, null, true, 'Europe/Paris');

module.exports = cronDeleteOutFiles;
