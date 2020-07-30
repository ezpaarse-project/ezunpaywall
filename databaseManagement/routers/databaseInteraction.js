const router = require('express').Router();
const path = require('path');
const {
  getStatus,
} = require('../services/unpaywall');
const {
  insertSnapshotBetweenDate,
  weeklyUpdate,
} = require('../services/weekly');

const {
  readSnapshotFileManually,
} = require('../services/manually');

/**
 * @api {get} /process/status get informations of content database
 */
router.get('/process/status', (req, res) => res.status(200).json({
  type: 'success',
  message: getStatus(),
}));

// middleware
router.use((req, res, next) => {
  if (getStatus().inProcess) {
    return res.status(409).json({
      type: 'error', message: 'process in progress', url: '/process/status',
    });
  }
  return next();
});

/**
 * @api {get} /updates/:name initialize or update database
 * @apiName InsertWithCustomFile
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {Number} [offset=0] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit=0] last line insertion by default, we have no limit
 * @apiParam (PARAMS) {String} name of file
 */
router.get('/updates/:name', (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(401).json({ type: 'error', message: 'name of snapshot file expected' });
  }
  if (name === 'weekly') {
    console.log(name);
    weeklyUpdate();
    return res.status(200).json({
      type: 'success', message: 'process start', url: '/process/status',
    });
  }
  // TODO filtrer le nom du fichier
  if (!path.resolve(__dirname, '..', '..', 'out', 'download', name)) {
    return res.status(404).json({ type: 'error', message: 'file doesn\'t exist' });
  }
  let { offset, limit } = req.query;
  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  readSnapshotFileManually(name, { offset: Number(offset), limit: Number(limit) });
  return res.status(200).json({
    type: 'success', message: `start upsert with ${name}`, url: '/process/status',
  });
});

/**
 * @api
 * @apiName
 * @apiGroup
 *
 * @apiParam (QUERY) {String} startDate
 * @apiParam (QUERY) {String} endDate
 */
router.get('/download/date/:startDate/:endDate', (req, res) => {
  const { startDate, endDate } = req.params;
  if (!startDate || !endDate) {
    return res.status(401).json({ type: 'error', message: 'startDate and endDate expected' });
  }
  const match = /^([0-9]*-[0-9]{2}-[0-9]{2}$)/;
  if (!match.exec(startDate) || !match.exec(endDate)) {
    return res.status(401).json({ type: 'error', message: 'startDate and endDate are in bad format' });
  }
  insertSnapshotBetweenDate(startDate, endDate);
  return res.status(200).json({
    type: 'success', message: 'process start', url: '/process/status',
  });
});

module.exports = router;
