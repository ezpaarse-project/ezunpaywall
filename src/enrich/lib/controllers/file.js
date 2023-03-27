/* eslint-disable no-restricted-syntax */
const fs = require('fs-extra');
const path = require('path');

/**
 * Get files in a directory in date order.
 *
 * @param {String} directoryPath - Directory path.
 *
 * @returns {array<string>} list of filepath in date order.
 */
async function orderRecentFiles(directoryPath) {
  const filenames = await fs.readdir(directoryPath);

  const files = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.resolve(directoryPath, filename);
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
 * get the most recent file in a directory
 *
 * @param {String} directoryPath directory path
 *
 * @returns {String} most recent filepath
 */
async function getMostRecentFile(directoryPath) {
  const files = await orderRecentFiles(directoryPath);
  return files.length ? files[0] : undefined;
}

/**
 * Delete files in directory when the last updated of file is more than n days.
 *
 * @param {String} directoryPath directory path
 * @param {*} numberOfDays number of days
 *
 * @returns {Array<String>} List of filename of deleted file
 */
async function deleteFilesInDir(directoryPath, numberOfDays) {
  const time = 1 * 24 * 60 * 60 * 1000 * numberOfDays;
  const threshold = Date.now() - time;

  const files = await fs.readdir(directoryPath);

  const deletedFiles = [];

  for (const file of files) {
    const stat = await fs.stat(path.join(directoryPath, file));
    if (stat.mtime < threshold) {
      deletedFiles.push(file);
      await fs.unlink(path.join(directoryPath, file));
    }
  }

  return deletedFiles;
}

module.exports = {
  getMostRecentFile,
  deleteFilesInDir,
  orderRecentFiles,
};
