/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const router = require('express').Router();
const fs = require('fs-extra');
const boom = require('@hapi/boom');

const logger = require('../lib/logger');

const updateChangefilesExample = require('../bin/changefiles');

router.patch('/changefiles', async (req, res, next) => {
  const { interval } = req.query;
  if (!interval) {
    return res.status(400).json(boom.badRequest('interval expected'));
  }

  const intervals = ['week', 'day'];
  if (!intervals.includes(interval)) {
    return res.status(404).json(boom.badRequest(`${interval} is not accepted, only week and day are accepted`));
  }

  const changefilesExample = require(`../snapshots/changefiles-${interval}-example.json`);

  // create local file if dosn't exist
  const changefilesPath = `../snapshots/changefiles-${interval}.json`;
  try {
    await fs.ensureFile(changefilesPath);
  } catch (err) {
    logger.error(err);
    return next(boom.boomify(err));
  }

  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefilesExample, null, 2), 'utf8');
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(changefilesExample, null, 2)} in file "${changefilesPath}"`);
    logger.error(err);
    return next(boom.boomify(err));
  }

  try {
    await updateChangefilesExample(interval);
  } catch (err) {
    logger.error(err);
    return next(boom.boomify(err));
  }

  return res.set('Location', changefilesPath).status(200).end();
});

module.exports = router;
