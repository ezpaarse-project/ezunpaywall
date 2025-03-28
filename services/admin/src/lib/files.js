/* eslint-disable no-restricted-syntax */
const fsp = require('fs/promises');
const path = require('path');
const appLogger = require('./logger/appLogger');

/**
 * Get the files in a directory in order by date.
 *
 * @param {string} dir Directory path.
 *
 * @returns {Promise<Array<{filename: string, stat: import('fs').Stats}>>} list of files
 * sorted by modification date.
 */
async function orderRecentFiles(dir) {
  const filenames = await fsp.readdir(dir);

  const files = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.resolve(dir, filename);
      return {
        filename,
        stat: await fsp.lstat(filePath),
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
 * @param {string} dir Directory path.
 *
 * @returns {Promise<{filename: string, stat: import('fs').Stats}|void>} most recent filepath.
 */
async function getMostRecentFile(dir) {
  const files = await orderRecentFiles(dir);
  return files.length ? files[0] : undefined;
}

/**
 * Delete file installed on ezunpaywall
 *
 * @param {string} filepath Filepath.
 *
 * @returns {Promise<void>}
 */
async function deleteFile(filepath) {
  try {
    await fsp.unlink(filepath);
  } catch (err) {
    appLogger.error(`[file] Cannot remove [${filepath}]`, err);
    throw err;
  }
  appLogger.info(`[file]: [${filepath}] deleted`);
}

/**
 * Deletes files in a directory that are older than n time.
 *
 * @param {string} directory Directory path.
 * @param {number} numberOfDays Number of days.
 *
 * @returns {Promise<Array<string>>} List of deleted files.
 */
async function deleteFilesInDir(directory, numberOfDays) {
  const time = 1 * 24 * 60 * 60 * 1000 * numberOfDays;
  const threshold = Date.now() - time;

  const files = await fsp.readdir(directory);

  const deletedFiles = [];

  for (const file of files) {
    const stat = await fsp.stat(path.join(directory, file));
    if (stat.mtime < threshold) {
      deletedFiles.push(file);
      await deleteFile(path.join(directory, file));
    }
  }

  return deletedFiles;
}

module.exports = {
  getMostRecentFile,
  deleteFilesInDir,
  deleteFile,
};
