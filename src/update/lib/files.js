/* eslint-disable no-restricted-syntax */
const fs = require('fs-extra');
const path = require('path');
const logger = require('./logger');
const dirPath = require('./path');

/**
 * Get path of directory depending on type.
 *
 * @param {string} process - Type of process (unpaywall or unpaywallHistory).
 * @param {string} type - Type of file (reports, snapshots).
 *
 * @returns {string} path of directory.
 */
function getPathOfDirectory(process, type) {
  return dirPath[process][`${type}Dir`];
}

/**
 * Get the files in a directory in order by date.
 *
 * @param {string} dir - Directory path.
 *
 * @returns {Promise<Array<{filename: string, stat: import('fs').Stats}>>} list of files
 * sorted by modification date.
 */
async function orderRecentFiles(dir) {
  const filenames = await fs.readdir(dir);

  const files = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.resolve(dir, filename);
      return {
        filename,
        stat: await fs.lstat(filePath),
      };
    }),
  );

  return files
    .filter((file) => file.stat.isFile())
    .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime());
}

/**
 * Get the most recent file in a directory.
 *
 * @param {string} dir - Directory path.
 *
 * @returns {Promise<{filename: string, stat: import('fs').Stats}|void>} most recent filepath.
 */
async function getMostRecentFile(dir) {
  const files = await orderRecentFiles(dir);
  return files.length ? files[0] : undefined;
}

/**
 * Delete file installed on ezunpaywall on "/data/snapshots".
 *
 * @param {string} filepath - Filepath.
 *
 * @returns {Promise<void>}
 */
async function deleteFile(filepath) {
  try {
    await fs.remove(filepath);
  } catch (err) {
    logger.error(`[file] Cannot remove [${filepath}]`, err);
    throw err;
  }
  logger.info(`[file]: [${filepath}] deleted`);
}

/**
 * Deletes files in a directory that are older than n time.
 *
 * @param {string} directory - Directory path.
 * @param {number} numberOfDays - Number of days.
 *
 * @returns {Promise<Array<string>>} List of deleted files.
 */
async function deleteFilesInDir(directory, numberOfDays) {
  const time = 1 * 24 * 60 * 60 * 1000 * numberOfDays;
  const threshold = Date.now() - time;

  const files = await fs.readdir(directory);

  const deletedFiles = [];

  for (const file of files) {
    const stat = await fs.stat(path.join(directory, file));
    if (stat.mtime < threshold) {
      deletedFiles.push(file);
      await deleteFile(path.join(directory, file));
    }
  }

  return deletedFiles;
}

module.exports = {
  getPathOfDirectory,
  getMostRecentFile,
  deleteFilesInDir,
  deleteFile,
};
