const router = require('express').Router();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const joi = require('joi');

const checkAuth = require('../middlewares/auth');

const snapshotsDir = path.resolve(__dirname, '..', 'snapshots');

router.use('/snapshots', express.static(path.resolve(snapshotsDir)));

router.get('/feed/changefile/:file', async (req, res, next) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

router.get('/daily-feed/changefile/:file', async (req, res, next) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

router.get('/feed/changefiles', checkAuth, async (req, res, next) => {
  const { error, value } = joi.string().trim().valid('day', 'week').default('day')
    .validate(req.query.interval);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const interval = value;

  const file = `changefiles-${interval}.json`;
  return res.sendFile(path.resolve(snapshotsDir, file));
});

router.get('/feed/snapshot', checkAuth, async (req, res) => res.sendFile(path.resolve(snapshotsDir, 'snapshot.jsonl.gz')));

module.exports = router;
