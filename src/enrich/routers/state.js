const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  getState,
} = require('../bin/state');

const {
  enrichJSON,
  enrichCSV,
} = require('../bin/utils');

const {
  checkAuth,
} = require('../middlewares/auth');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');
const stateDir = path.resolve(__dirname, '..', 'out', 'states');

/**
 * get the files in a dir in order by date
 * @param {string} dir - dir path
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
* @param {string} dir - dir path
* @returns {string} most recent file path
*/
const getMostRecentFile = async (dir) => {
  const files = await orderRecentFiles(dir);
  return Array.isArray(files) ? files[0] : undefined;
};

/**
 * get the most recent state in JSON format
 *
 * @apiSuccess state
 */
router.get('/state', async (req, res, next) => {
  let latestFile;
  try {
    latestFile = await getMostRecentFile(stateDir);
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
 * @apiError 404 file not found
 *
 * @apiSuccess state
 */
router.get('/state/:filename', async (req, res, next) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(stateDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }

  let state;
  try {
    state = await getState(filename);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ state });
});

/**
 * get enriched file
 *
 * @apiParam PARAMS args - filename
 *
 * @apiError 400 filename expected
 * @apiError 404 file not found
 *
 * @apiSuccess enriched file
 */
router.get('/enriched/:filename', async (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(enrichedDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  return res.sendFile(path.resolve(enrichedDir, filename));
});

/**
 * enrich a jsonl file
 *
 * @apiParam PARAMS id - id of process
 *
 * @apiParam QUERY args - graphql attributes for enrichment
 *
 * @apiError 500 internal server error
 *
 * @apiSuccess name of enriched file to download it
 */
router.post('/json/:id', checkAuth, async (req, res, next) => {
  const { args } = req.query;
  // TODO check args with graphqlSyntax
  let { index } = req.query;
  if (!index) index = 'unpaywall';
  const { id } = req.params;
  // TODO check if id is already used
  try {
    await enrichJSON(req, args, id, index);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ id });
});

/**
 * enrich a csv file
 *
 * @apiParam PARAMS id - id of process
 *
 * @apiParam QUERY args - graphql attributes for enrichment
 *
 * @apiError 500 internal server error
 *
 * @apiSuccess name of enriched file to download it
 */
router.post('/csv/:id', checkAuth, async (req, res, next) => {
  const { args } = req.query;
  let { index } = req.query;
  if (!index) index = 'unpaywall';
  // TODO check args with graphqlSyntax
  const { id } = req.params;
  // TODO check if is is already used
  let { separator } = req.query;
  if (!separator) separator = ',';
  try {
    await enrichCSV(req, args, separator, id, index);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ id });
});

module.exports = router;