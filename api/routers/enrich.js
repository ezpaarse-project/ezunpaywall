const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  getState,
} = require('../services/enrich/state');

const {
  enrichJSON,
  enrichCSV,
} = require('../services/enrich/utils');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enrich', 'enriched');
const stateDir = path.resolve(__dirname, '..', 'out', 'enrich', 'state');

/**
 * get the files in a dir in order by date
 * @param {string} dir - dir path
 * @returns {array<string>} files path in order
 */
const orderReccentFiles = (dir) => fs.readdirSync(dir)
  .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
  .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

/**
* get the most recent file in a dir
* @param {string} dir - dir path
* @returns {string} most recent file path
*/
const getMostRecentFile = async (dir) => {
  const files = await orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

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
router.post('/enrich/json/:id', async (req, res) => {
  const { args } = req.query;
  // TODO check args with graphqlSyntax
  const { id } = req.params;
  // TODO check if id is already used
  try {
    await enrichJSON(req, args, id);
  } catch (err) {
    return res.status(500).json({ message: `internal server error: ${err}` });
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
router.post('/enrich/csv/:id', async (req, res) => {
  const { args } = req.query;
  // TODO check args with graphqlSyntax
  const { id } = req.params;
  // TODO check if is is already used
  let { separator } = req.query;
  if (!separator) separator = ',';
  try {
    await enrichCSV(req, args, separator, id);
  } catch (err) {
    return res.status(500).json({ message: `internal server error: ${err}` });
  }
  return res.status(200).json({ id });
});

/**
 * get the most recent state in JSON format
 *
 * @apiSuccess state
 */
router.get('/enrich/state', async (req, res) => {
  const latestFile = await getMostRecentFile(stateDir);
  const state = await getState(latestFile?.file.split('.')[0]);
  res.status(200).json({ state });
});

/**
 * get state in JSON format
 *
 * @apiParam PARAMS id - id of process
 *
 * @apiError 400 id expected
 * @apiError 404 file not found
 *
 * @apiSuccess state
 */
router.get('/enrich/state/:id', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: 'id expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(stateDir, `${id}.json`));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  const state = await getState(id);
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
router.get('/enrich/:filename', async (req, res) => {
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

module.exports = router;
