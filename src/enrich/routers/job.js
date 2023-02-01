const router = require('express').Router();
const joi = require('joi');

const {
  enrichJSON,
  enrichCSV,
} = require('../controllers/job');

const checkAuth = require('../middlewares/auth');

/**
 *
 *
 * @return name of enriched file to download it
 */
router.post('/job/:filename', checkAuth, async (req, res, next) => {
  const checkParams = joi.string().trim().required().validate(req.params.filename);

  if (checkParams?.error) {
    return res.status(400).json({ message: checkParams?.error?.details[0].message });
  }

  const id = checkParams?.value;
  // TODO check args with graphqlSyntax
  const { error, value } = joi.object({
    type: joi.string().trim().valid('jsonl', 'csv').required(),
    args: joi.string().trim(),
    index: joi.string().trim().default('unpaywall'),
    separator: joi.string().trim().default(','),
  }).validate(req.body);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    type, args, index, separator,
  } = value;

  const apiKey = req.get('x-api-key');

  if (type === 'jsonl') {
    enrichJSON(id, index, args, apiKey);
  }

  if (type === 'csv') {
    enrichCSV(id, index, args, apiKey, separator);
  }

  return res.status(200).json(id);
});

module.exports = router;
