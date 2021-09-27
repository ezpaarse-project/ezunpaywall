const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  getState,
} = require('../bin/state');

const statesDir = path.resolve(__dirname, '..', 'out', 'states');

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
  return Array.isArray(files) ? files[0] : undefined;
};

/**
 * get the most recent state in JSON format
 *
 * @return state
 */
router.get('/state', async (req, res, next) => {
  let latestFile;
  try {
    latestFile = await getMostRecentFile(statesDir);
  } catch (err) {
    return next(err);
  }
  let state;
  try {
    state = await getState(latestFile?.filename);
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({ state });
});

/**
 * get state in JSON format
 *
 * @apiParam PARAMS filename - state
 *
 * @apiError 400 id expected
 * @apiError 404 File not found
 *
 * @return state
 */
router.get('/state/:filename', async (req, res, next) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(statesDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'File not found' });
  }

  let state;
  try {
    state = await getState(filename);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ state });
});

module.exports = router;
