const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { paths } = require('config');

const validateJobConfig = require('../middlewares/job');
const checkApiKey = require('../middlewares/user');
const checkArgs = require('../middlewares/args');

const { enrichJSON, enrichCSV } = require('../lib/job');

/**
 * Route that start a enrich job.
 *
 * This route need a body that contains a config of job
 * and a param filename which corresponds to the upload filename
 */
router.post('/job/:filename', checkApiKey, checkArgs, validateJobConfig, async (req, res, next) => {
  const { id, config } = req.data;

  const apikey = req.get('x-api-key');

  const {
    type, args, index, separator, prefix,
  } = config;

  if (!await fs.existsSync(path.resolve(paths.data.uploadDir, apikey, `${id}.${type}`))) {
    return res.status(404).json({ message: `[file]: ${id}.${type} not found` });
  }

  if (type === 'jsonl') {
    enrichJSON(id, index, args, prefix, apikey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apikey, prefix, separator);
  }

  return res.status(200).json(id);
});

module.exports = router;
