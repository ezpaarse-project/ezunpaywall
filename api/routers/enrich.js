const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const { enrichmentFileJSON, checkAttributesJSON, setEnrichAttributesJSON } = require('../services/enrich/json');
const { enrichmentFileCSV, checkAttributesCSV, setEnrichAttributesCSV } = require('../services/enrich/csv');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');

/**
 * @api {post} /enrich/json enrich a json file
 * @apiName Enrich json
 * @apiGroup Enrich
 *
 */
router.post('/enrich/json', async (req, res) => {
  const { args } = req.query;
  let attrs = [];
  if (args) {
    const enrichAttributesJSON = setEnrichAttributesJSON();
    attrs = checkAttributesJSON(args, enrichAttributesJSON);
    if (!attrs) {
      return res.status(401).json({ message: 'args incorrect' });
    }
  }
  const file = await enrichmentFileJSON(req, attrs);
  return res.status(200).json({ file });
});

/**
 * @api {get} /enrich/csv enrich a csv file
 * @apiName Enrich csv
 * @apiGroup Enrich
 *
 */
router.post('/enrich/csv', async (req, res) => {
  const { args } = req.query;
  let { separator } = req.query;
  let attrs = [];
  if (args) {
    const enrichAttributesCSV = setEnrichAttributesCSV();
    attrs = checkAttributesCSV(args, enrichAttributesCSV);
    if (!attrs) {
      return res.status(401).json({ message: 'args incorrect' });
    }
  }
  if (!separator) separator = ',';
  const file = await enrichmentFileCSV(req, attrs, separator);
  return res.status(200).json({ file });
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
  res.sendFile(path.resolve(enrichedDir, file));
});

module.exports = router;
