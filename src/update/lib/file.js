const fs = require('fs-extra');
const path = require('path');

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

module.exports = {
  orderRecentFiles,
  getMostRecentFile,
};
