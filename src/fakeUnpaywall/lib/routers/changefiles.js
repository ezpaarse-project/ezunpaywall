/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const router = require('express').Router();
const path = require('path');
const fs = require('fs-extra');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'snapshots');

const logger = require('../logger');

const updateChangefilesExample = require('../controllers/changefiles');

/**
 * Route that update changefiles.
 *
 * This route need a query that contains the interval of registry.
 */
router.patch('/changefiles', async (req, res, next) => {
  const { interval } = req.query;
  if (!interval) {
    return res.status(400).json({ message: 'interval expected' });
  }

  const intervals = ['week', 'day'];
  if (!intervals.includes(interval)) {
    return res.status(404).json({ message: `${interval} is not accepted, only week and day are accepted` });
  }

  const changefilesExample = require(`${snapshotsDir}/changefiles-${interval}-example.json`);

  // create local file if dosn't exist
  const changefilesPath = path.resolve(snapshotsDir, `changefiles-${interval}.json`);
  try {
    await fs.ensureFile(changefilesPath);
  } catch (err) {
    logger.error(err);
    return next({ message: err, stackTrace: err });
  }

  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefilesExample, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(changefilesExample, null, 2)} in file "${changefilesPath}"`);
    logger.error(err);
    return next({ message: err, stackTrace: err });
  }

  try {
    await updateChangefilesExample(interval);
  } catch (err) {
    logger.error(err);
    return next({ message: err, stackTrace: err });
  }

  return res.set('Location', changefilesPath).status(200).end();
});

module.exports = router;
