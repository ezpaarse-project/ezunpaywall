/* eslint-disable no-restricted-syntax */
const { CronJob } = require('cron');
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');
const statesDir = path.resolve(__dirname, '..', 'out', 'states');
const uploadDir = path.resolve(__dirname, '..', 'out', 'upload');

const deleteFilesInDir = async (directory, maxAgeInDays) => {
  const time = 1 * 24 * 60 * 60 * 1000 * maxAgeInDays;
  const thershold = Date.now() - time;

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
      if (stat.mtime < thershold) {
        await fs.unlink(path.join(directory, file));
      }
    } catch (err) {
      logger.error(err);
      return;
    }
  }
};

const cronDeleteOutFiles = new CronJob('0 0 0 * * *', async () => {
  await deleteFilesInDir(enrichedDir, 1);
  logger.info('Delete enriched file');

  await deleteFilesInDir(statesDir, 1);
  logger.info('Delete states file');

  await deleteFilesInDir(uploadDir, 1);
  logger.info('Delete uploaded file');
}, null, true, 'Europe/Paris');

module.exports = cronDeleteOutFiles;
