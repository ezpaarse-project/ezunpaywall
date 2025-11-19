const router = require('express').Router();
const express = require('express');
const path = require('path');
const fs = require('fs');
const joi = require('joi');

const checkAuth = require('../middlewares/auth');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'snapshots');

/**
 * Route that give the list of filename snapshots on fakeUnpaywall
 */
router.use('/snapshots', express.static(path.resolve(snapshotsDir)));

/**
 * Route that give a weekly changefile.
 *
 * This route need a param that contains the filename of changefile.
 */
router.get('/feed/changefiles/:file', async (req, res) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.existsSync(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

/**
 * Route that give a daily changefile.
 *
 * This route need a param that contains the filename of changefile.
 */
router.get('/daily-feed/changefile/:file', async (req, res) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.existsSync(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

/**
 * Route that give the changefile registry.
 *
 * This route can take a query that contains the interval of changefile.
 */
router.get('/feed/changefiles', checkAuth, async (req, res) => {
  const { error, value } = joi.string().trim().valid('day', 'week').default('day')
    .validate(req.query.interval);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const interval = value;

  const file = `changefiles-${interval}.json`;
  return res.sendFile(path.resolve(snapshotsDir, file));
});

/**
 * Route that the current snapshot.
 */
router.get('/feed/snapshot', checkAuth, async (req, res) => res.sendFile(path.resolve(snapshotsDir, 'snapshot.jsonl.gz')));

module.exports = router;
