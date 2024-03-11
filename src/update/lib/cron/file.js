const logger = require('../logger');
const Cron = require('../cron');
const dirPath = require('../path');
const { deleteFilesInDir } = require('../files');

/**
 * Removes files generated by an update process that are older than 30 days.
 *
 * @returns {Promise<void>}
 */
async function task() {
  // TODO env variable for the "30"
  const deletedSnapshotFiles = await deleteFilesInDir(dirPath.snapshotsDir, 30);
  logger.info(`[cron][files]: ${deletedSnapshotFiles?.join(',')} (${deletedSnapshotFiles.length}) snapshots are deleted`);

  const deletedReportFiles = await deleteFilesInDir(dirPath.reportsDir, 30);
  logger.info(`[cron][files]: ${deletedReportFiles?.join(',')} (${deletedReportFiles.length}) reports are deleted`);
}

const cron = new Cron('files', '0 0 0 * * *', task, true);

module.exports = cron;
