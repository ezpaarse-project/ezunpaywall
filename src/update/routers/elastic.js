const router = require('express').Router();

const { initAlias } = require('../lib/service/elastic');
const unpaywallMapping = require('../mapping/unpaywall.json');

router.post('/elastic/alias', async (req, res, next) => {
  try {
    await initAlias('unpaywall', unpaywallMapping, 'upw');
  } catch (err) {
    return next(err);
  }

  return res.status(202).end();
});

module.exports = router;
