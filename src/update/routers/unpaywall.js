const router = require('express').Router();
const axios = require('axios');
const config = require('config');

const logger = require('../lib/logger');

const url = `${config.get('unpaywallURL')}`;

router.get('/unpaywall/snapshot', async (req, res, next) => {
  let { interval } = req.query;

  if (!interval) {
    interval = 'day';
  }

  const intervals = ['week', 'day'];
  if (!intervals.includes(interval)) {
    return res.status(400).json({ message: `${interval} is not accepted, only 'week' and 'day' are accepted` });
  }

  let snapshotsInfo;
  try {
    snapshotsInfo = await axios({
      method: 'get',
      url,
      params: {
        apikey: config.get('apikeyupw'),
        interval,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    logger.error(`Cannot request ${url}`);
    logger.error(err);
    return res.status(403).json({ message: `Cannot request ${url}` });
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
