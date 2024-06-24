const { paths } = require('config');

const Cron = require('./models/cron');
const logger = require('./logger');

const { deleteFilesInDir } = require('./file');

/**
 * Removes files generated by an enrichment that are older than one day.
 *
 * @returns {Promise<void>}
 */
async function task() {
  const deletedEnrichedFiles = await deleteFilesInDir(paths.data.enrichedDir, 1);
  logger.info(`[cron][files]: ${deletedEnrichedFiles?.join(',')} (${deletedEnrichedFiles.length}) enriched files are deleted`);

  const deletedStatesFiles = await deleteFilesInDir(paths.data.statesDir, 1);
  logger.info(`[cron][files]: ${deletedStatesFiles?.join(',')} (${deletedStatesFiles.length}) enriched files are deleted`);

  const deletedUploadedFiles = await deleteFilesInDir(paths.data.uploadDir, 1);
  logger.info(`[cron][files]: ${deletedUploadedFiles?.join(',')} (${deletedUploadedFiles.length}) enriched files are deleted`);
}

/**
 * Cron that runs every day to delete files generated by an enrichment that are older than one day.
 */
const cron = new Cron('delete out files', '0 0 0 * * *', task, true);

module.exports = cron;
