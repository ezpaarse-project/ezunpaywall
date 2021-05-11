const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const { enrichmentFileJSON, checkAttributesJSON, setEnrichAttributesJSON } = require('../services/enrich/json');
const { enrichmentFileCSV, checkAttributesCSV, setEnrichAttributesCSV } = require('../services/enrich/csv');
const { createState, getState, updateStatus } = require('../services/enrich/state');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enrich', 'enriched');
const stateDir = path.resolve(__dirname, '..', 'out', 'enrich', 'state');

const orderReccentFiles = async (dir) => fs.readdirSync(dir)
  .filter(async (file) => fs.lstatSync(path.join(dir, file)).isFile())
  .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

const getMostRecentFile = async (dir) => {
  const files = await orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

router.post('/enrich/state', async (req, res) => {
  const state = await createState();
  return res.status(200).json({ state });
});

router.post('/enrich/json', async (req, res) => {
  const { args } = req.query;
  const { state } = req.query;
  let attrs = [];
  if (args) {
    const enrichAttributesJSON = setEnrichAttributesJSON();
    attrs = checkAttributesJSON(args, enrichAttributesJSON);
    if (!attrs) {
      await updateStatus(state, 'error');
      return res.status(401).json({ message: 'args incorrect' });
    }
  }
  let file;
  try {
    file = await enrichmentFileJSON(req, attrs, state);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
  return res.status(200).json({ file });
});

router.post('/enrich/csv', async (req, res) => {
  const { args } = req.query;
  let { separator } = req.query;
  const { state } = req.query;
  let attrs = [];
  if (args) {
    const enrichAttributesCSV = setEnrichAttributesCSV();
    attrs = checkAttributesCSV(args, enrichAttributesCSV);
    if (!attrs) {
      await updateStatus(state, 'error');
      return res.status(401).json({ message: 'args incorrect' });
    }
  }
  if (!separator) separator = ',';
  let file;
  try {
    file = await enrichmentFileCSV(req, attrs, separator, state);
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
