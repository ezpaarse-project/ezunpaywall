const path = require('path');
const logger = require('../../lib/logger');
const Cron = require('../../lib/cron');

const { deleteFilesInDir } = require('../file');

const reportsDir = path.resolve(__dirname, '..', '..', 'data', 'reports');
const snapshotDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');
const states = path.resolve(__dirname, '..', '..', 'data', 'states');

async function task() {
  await deleteFilesInDir(reportsDir, 30);
  logger.info('Delete reports files older than 1 months');

  await deleteFilesInDir(snapshotDir, 30);
  logger.info('Delete snapshots files older than 1 months');

  await deleteFilesInDir(states, 30);
  logger.info('Delete states files older than 1 months');
}

const cron = new Cron('DeleteFileOlderThanOneMonth', '0 0 0 * * *', task, true);

module.exports = cron;
