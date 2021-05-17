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

router.post('/enrich/json', async (req, res) => {
  const { args } = req.query;
  // TODO check args with graphqlSyntax
  let file;
  try {
    file = await enrichJSON(req, args);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  return res.status(200).json({ file });
});

router.post('/enrich/csv', async (req, res) => {
  const { args } = req.query;
  // TODO check args with graphqlSyntax
  let { separator } = req.query;
  if (!separator) separator = ',';
  let file;
  try {
    file = await enrichCSV(req, args, separator);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  return res.status(200).json({ file });
});

router.get('/enrich/state', async (req, res) => {
  const latestFile = await getMostRecentFile(stateDir);
  const state = await getState(latestFile?.file);
  res.status(200).json({ state });
});

router.get('/enrich/state/:name', async (req, res) => {
  const { name } = req.params;
  const state = await getState(name);
  return res.status(200).json({ state });
});

router.get('/enrich/:file', async (req, res) => {
  const { file } = req.params;
  if (!file) {
    return res.status(400).json({ message: 'name of enriched file expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(enrichedDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  return res.sendFile(path.resolve(enrichedDir, file));
});

module.exports = router;
