const router = require('express').Router();
const express = require('express');
const path = require('path');
const fs = require('fs-extra');
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
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeParams {string} file - Name of weekly changefile.
 *
 * @routeResponse {File} Weekly changefile.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/feed/changefile/:file', async (req, res) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

/**
 * Route that give a daily changefile.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeParams {string} file - Name of daily changefile.
 *
 * @routeResponse {File} Daily changefile.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/daily-feed/changefile/:file', async (req, res) => {
  const { error, value } = joi.string().trim().validate(req.params.file);

  if (error) return res.status(400).json({ message: error.details[0].message });

  const file = value;

  const fileExist = await fs.pathExists(path.resolve(snapshotsDir, file));
  if (!fileExist) {
    return res.status(404).json({ message: `${file} not found` });
  }
  return res.sendFile(path.resolve(snapshotsDir, file));
});

/**
 * Route that give the changefile registry.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeQuery {string} interval - interval of changefile,
 * day or week are available.
 *
 * @routeResponse {Object} Registry of changefile.
 *
 * @return {import('express').Response} HTTP response.
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
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {File} Current snapshot.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/feed/snapshot', checkAuth, async (req, res) => res.sendFile(path.resolve(snapshotsDir, 'snapshot.jsonl.gz')));

module.exports = router;
