const path = require('path');
const Cron = require('../../cron');
const logger = require('../../logger');

const enrichedDir = path.resolve(__dirname, '..', '..', 'data', 'enriched');
const statesDir = path.resolve(__dirname, '..', '..', 'data', 'states');
const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');

const { deleteFilesInDir } = require('../file');

async function task() {
  const deletedEnrichedFiles = await deleteFilesInDir(enrichedDir, 1);
  logger.info(`[cron: delete out files] ${deletedEnrichedFiles?.join(',')} (${deletedEnrichedFiles.length}) enriched files are deleted`);

  const deletedStatesFiles = await deleteFilesInDir(statesDir, 1);
  logger.info(`[cron: delete out files] ${deletedStatesFiles?.join(',')} (${deletedStatesFiles.length}) enriched files are deleted`);

  const deletedUploadedFiles = await deleteFilesInDir(uploadDir, 1);
  logger.info(`[cron: delete out files] ${deletedUploadedFiles?.join(',')} (${deletedUploadedFiles.length}) enriched files are deleted`);
}

const cron = new Cron('delete out files', '0 0 0 * * *', task, true);

module.exports = cron;
