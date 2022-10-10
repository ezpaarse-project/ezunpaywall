const router = require('express').Router();
const joi = require('joi');

const { getChangefiles } = require('../lib/service/unpaywall');

router.get('/unpaywall/changefiles', async (req, res, next) => {
  const { error, value } = joi.string().trim().valid('week', 'day').default('day')
    .validate(req.body.interval);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const interval = value;

  let snapshotsInfo;

  try {
    snapshotsInfo = await getChangefiles(interval, new Date(0), new Date());
  } catch (err) {
    return next({ message: err, stackTrace: err });
  }

  const { latest } = req.query;
  if (latest) {
    return res.status(200).json(snapshotsInfo[0]);
  }
  return res.status(200).json(snapshotsInfo);
});

module.exports = router;
