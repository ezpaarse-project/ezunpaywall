const router = require('express').Router();
const path = require('path');

const {
  insertSnapshotBetweenDate,
  weeklyUpdate,
} = require('../services/weekly');

const {
  readSnapshotFileManually,
} = require('../services/manually');

// middleware
// router.use((req, res, next) => {
//   if (postStatus().inProcess) {
//     return res.status(409).json({
//       message: 'process in progress, check /insert/status',
//     });
//   }
//   return next();
// });

/**
 * @api {post} /insert/:name initialize or update database
 * @apiName InsertWithCustomFile
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {Number} [offset=0] first line insertion, by default, we start with the first
 * @apiParam (QUERY) {Number} [limit=0] last line insertion by default, we have no limit
 * @apiParam (PARAMS) {String} name of file
 */
router.post('/insert/:name', (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(401).json({ message: 'name of snapshot file expected' });
  }
  // TODO filtrer le nom du fichier
  if (!path.resolve(__dirname, '..', '..', 'out', 'download', name)) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  let { offset, limit } = req.query;
  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  readSnapshotFileManually(name, { offset: Number(offset), limit: Number(limit) });
  return res.status(200).json({
    message: `start upsert with ${name}`,
  });
});

router.get('/insertWeekly', (req, res) => {
  weeklyUpdate();
  return res.status(200).json({
    message: 'process start check /insert/status',
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
router.post('/insert/date/:startDate/:endDate', (req, res) => {
  const { startDate, endDate } = req.params;
  if (!startDate || !endDate) {
    return res.status(401).json({ message: 'startDate and endDate expected' });
  }
  const pattern = /^([0-9]*-[0-9]{2}-[0-9]{2}$)/;
  if (!pattern.test(startDate) || !pattern.test(endDate)) {
    return res.status(401).json({ message: 'startDate and endDate are in bad format' });
  }
  insertSnapshotBetweenDate(startDate, endDate);
  return res.status(200).json({
    message: 'process start check /insert/status',
  });
});

module.exports = router;
