const path = require('path');
const logger = require('../../logger');
const Cron = require('../../cron');

const { deleteFilesInDir } = require('../file');

const reportsDir = path.resolve(__dirname, '..', '..', '..', 'data', 'reports');
const snapshotDir = path.resolve(__dirname, '..', '..', '..', 'data', 'snapshots');
const states = path.resolve(__dirname, '..', '..', '..', 'data', 'states');

async function task() {
  const deletedReportFiles = await deleteFilesInDir(reportsDir, 30);
  logger.info(`[cron: delete out files] ${deletedReportFiles?.join(',')} (${deletedReportFiles.length}) reports are deleted`);

  const deletedSnapshotFiles = await deleteFilesInDir(snapshotDir, 30);
  logger.info(`[cron: delete out files] ${deletedSnapshotFiles?.join(',')} (${deletedSnapshotFiles.length}) snapshots are deleted`);

  const deletedStateFiles = await deleteFilesInDir(states, 30);
  logger.info(`[cron: delete out files] ${deletedStateFiles?.join(',')} (${deletedStateFiles.length}) states are deleted`);
}

const cron = new Cron('delete out files', '0 0 0 * * *', task, true);

module.exports = cron;
