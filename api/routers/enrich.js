const router = require('express').Router();
const path = require('path');

const { enrichmentFileJSON, checkAttributesJSON, setEnrichAttributesJSON } = require('../services/enrich/json');
const { enrichmentFileCSV, checkAttributesCSV, setEnrichAttributesCSV } = require('../services/enrich/csv');

const tmpDir = path.resolve(__dirname, '..', 'out', 'tmp');

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
  await enrichmentFileJSON(req, attrs);
  return res.status(200).download(path.resolve(tmpDir, 'enriched.jsonl'));
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
  await enrichmentFileCSV(req, attrs, separator);
  return res.status(200).download(path.resolve(tmpDir, 'enriched.csv'));
});

module.exports = router;
