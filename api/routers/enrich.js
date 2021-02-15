const router = require('express').Router();
const path = require('path');

const { enrichmentFileJSON } = require('../services/enrich/json');
const { enrichmentFileCSV } = require('../services/enrich/csv');

const tmpDir = path.resolve(__dirname, '..', 'out', 'tmp');

/**
 * @api {post} /enrich/json enrich a json file
 * @apiName Enrich json
 * @apiGroup Enrich
 *
 */
router.post('/enrich/json', async (req, res) => {
  let { args } = req.query;
  if (!args) {
    return res.status(400).json({ message: 'name of snapshot file expected' });
  }
  await enrichmentFileJSON(req, args);
  return res.status(200).download(path.resolve(tmpDir, 'enriched.jsonl'));
});

/**
 * @api {get} /enrich/json enrich a json file
 * @apiName Enrich csv
 * @apiGroup Enrich
 *
 */
router.post('/enrich/csv', async (req, res) => res.status(200).json({
  coucou: 'coucou',
}));

module.exports = router;
