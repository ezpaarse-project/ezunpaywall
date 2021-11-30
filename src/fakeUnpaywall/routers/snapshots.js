const router = require('express').Router();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');

const checkAuth = require('../middlewares/auth');

const snapshotsDir = path.resolve(__dirname, '..', 'snapshots');

router.use('/snapshots', express.static(path.resolve(snapshotsDir)));

router.get('/feed/changefile/:file', async (req, res) => {
  const { file } = req.params;
  if (!file) {
    return res.status(400).json({ message: 'name of snapshot file expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

router.get('/feed/changefile', checkAuth, async (req, res) => {
  const { interval } = req.query;

  if (!interval) {
    return res.status(400).json({ message: 'interval expected' });
  }

  const intervals = ['week', 'day'];
  if (!intervals.includes(interval)) {
    return res.status(400).json({ message: `${interval} is not accepted, only week and day are accepted` });
  }
  const file = `changefiles-${interval}.json`;
  return res.sendFile(path.resolve(snapshotsDir, file));
});

router.get('/feed/snapshot', checkAuth, async (req, res) => res.sendFile(path.resolve(snapshotsDir, 'snapshot.jsonl.gz')));

module.exports = router;
