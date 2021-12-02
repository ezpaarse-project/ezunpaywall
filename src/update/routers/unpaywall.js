const router = require('express').Router();
const axios = require('axios');
const config = require('config');
const joi = require('joi');
const boom = require('@hapi/boom');

const unpaywallHost = `${config.get('unpaywall.host')}`;

router.get('/unpaywall/snapshot', async (req, res, next) => {
  const schema = joi.object({
    interval: joi.string().trim().valid('week', 'day').default('day'),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(boom.badRequest(error.details[0].message));
  }

  const { interval } = value;

  let snapshotsInfo;
  try {
    snapshotsInfo = await axios({
      method: 'get',
      url: unpaywallHost,
      params: {
        api_key: config.get('unpaywall.apikey'),
        interval,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return next(boom.unauthorized());
  }

  snapshotsInfo = snapshotsInfo.data.list;
  snapshotsInfo = snapshotsInfo
    .filter((file) => file.filetype === 'jsonl');

  const { latest } = req.query;
  if (latest) {
    return res.status(200).json(snapshotsInfo[0]);
  }
  return res.status(200).json(snapshotsInfo);
});

module.exports = router;
