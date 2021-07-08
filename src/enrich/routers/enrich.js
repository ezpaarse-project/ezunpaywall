const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const {
  enrichJSON,
  enrichCSV,
} = require('../bin/utils');

const {
  checkAuth,
} = require('../middlewares/auth');

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
  const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');
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
  const apiKey = req.get('x-api-key');
  if (!index) index = 'unpaywall';
  const { id } = req.params;
  // TODO check if id is already used
  try {
    await enrichJSON(req, args, id, index, apiKey);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ id });
});

/**
 * enrich a csv file
 *
 * @apiParam PARAMS id - id of process
 * @apiParam QUERY args - graphql attributes for enrichment
 *
 * @apiError 500 internal server error
 *
 * @apiSuccess name of enriched file to download it
 */
router.post('/csv/:id', checkAuth, async (req, res, next) => {
  const { args } = req.query;
  let { index } = req.query;
  const apiKey = req.get('x-api-key');
  if (!index) index = 'unpaywall';
  // TODO check args with graphqlSyntax
  const { id } = req.params;
  // TODO check if is is already used
  let { separator } = req.query;
  if (!separator) separator = ',';
  try {
    await enrichCSV(req, args, id, separator, index, apiKey);
  } catch (err) {
    return next(err);
  }
  return res.status(200).json({ id });
});

module.exports = router;
