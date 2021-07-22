const router = require('express').Router();
const axios = require('axios');
const config = require('config');

const logger = require('../lib/logger');

const url = `${config.get('unpaywallURL')}?api_key=${config.get('apikeyupw')}`;

router.get('/unpaywall/snapshot', async (req, res, next) => {
  let snapshotsInfo;
  try {
    snapshotsInfo = await axios({
      method: 'get',
      url,
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
