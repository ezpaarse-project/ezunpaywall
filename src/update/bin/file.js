/* eslint-disable no-restricted-syntax */
const fs = require('fs-extra');
const path = require('path');
const logger = require('../lib/logger');

/**
 * get the files in a dir in order by date
 * @param {String} dir - dir path
 * @returns {array<string>} files path in order
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
 * get the most recent file in a dir
 * @param {String} dir - dir path
 * @returns {String} most recent file path
 */
const getMostRecentFile = async (dir) => {
  const files = await orderRecentFiles(dir);
  return files.length ? files[0] : undefined;
};

async function deleteFilesInDir(directory, maxAgeInDays) {
  const time = 1 * 24 * 60 * 60 * 1000 * maxAgeInDays;
  const threshold = Date.now() - time;

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
      if (stat.mtime < threshold) {
        await fs.unlink(path.join(directory, file));
      }
    } catch (err) {
      logger.error(err);
      return;
    }
  }
}

module.exports = {
  getMostRecentFile,
  deleteFilesInDir,
  orderRecentFiles,
};