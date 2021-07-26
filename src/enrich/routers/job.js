const router = require('express').Router();

const logger = require('../lib/logger');
const {
  enrichJSON,
  enrichCSV,
} = require('../bin/utils');

const {
  checkAuth,
} = require('../middlewares/auth');

/**
 *
 *
 * @apiParam QUERY args - graphql attributes for enrichment
 *
 * @apiError 500 internal server error
 *
 * @apiSuccess name of enriched file to download it
 */
router.post('/job', checkAuth, async (req, res, next) => {
  // TODO create route to upload file with id and use this route after
  const { id, type, args } = req.body;
  let { index, separator } = req.body;

  const apiKey = req.get('x-api-key');

  // TODO check args with graphqlSyntax
  if (!id) {
    return res.status(404).json({ message: 'id expected' });
  }

  if (!type) {
    return res.status(404).json({ message: 'type expected' });
  }

  if (!index) index = 'unpaywall';

  if (type === 'jsonl') {
    try {
      await enrichJSON(id, index, args, apiKey);
    } catch (err) {
      logger.error(`Cannot enrich ${id}.jsonl`);
      logger.error(err);
      return next(err);
    }
  }

  if (!separator) separator = ',';

  if (type === 'csv') {
    try {
      await enrichCSV(id, index, args, apiKey, separator);
    } catch (err) {
      logger.error(`Cannot enrich ${id}.csv`);
      logger.error(err);
      return next(err);
    }
  }

  return res.status(200).json({ id });
});

module.exports = router;
