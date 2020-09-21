const router = require('express').Router();
const path = require('path');

const {
  insertion,
  weeklyUpdate,
  insertSnapshotBetweenDate,
} = require('../services/unpaywall');

const {
  tasks,
} = require('../services/status');

// middleware
router.use((req, res, next) => {
  if (tasks.currentTask !== '') {
    return res.status(409).json({
      message: 'process in progress, check /insert/status',
    });
  }
  return next();
});

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
  let { offset, limit } = req.query;
  if (!name) {
    return res.status(401).json({ message: 'name of snapshot file expected' });
  }
  const pattern = /[a-zA-Z0-9_.-]+/;
  if (!pattern.test(name)) {
    return res.status(401).json({ message: 'name of file is in bad format (accepted [a-zA-Z0-9_.-] patern)' });
  }
  if (!path.resolve(__dirname, '..', '..', 'out', 'download', name)) {
    return res.status(404).json({ message: 'file doesn\'t exist' });
  }
  if (limit < offset) {
    return res.status(401).json({ message: 'limit can\t be lower than offset or 0' });
  }

  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  insertion(name, { offset: Number(offset), limit: Number(limit) });
  return res.status(200).json({
    message: `start upsert with ${name}`,
  });
});

/**
 * @api
 * @apiName
 * @apiGroup ManageDatabase
 *
 * @apiParam (QUERY) {String} start at format YYYY-mm-dd
 * @apiParam (QUERY) {String} end at format YYYY-mm-dd
 */
router.post('/insert', (req, res) => {
  const { start } = req.query;
  let { end } = req.query;
  if (!start && !end) {
    weeklyUpdate();
    return res.status(200).json({
      message: 'weekly update has begun, list of tasks has been created on elastic',
    });
  }
  if (start && !end) {
    [end] = new Date().toISOString().split('T');
  }

  const pattern = /^([0-9]*-[0-9]{2}-[0-9]{2}$)/;
  if (!pattern.test(start) || !pattern.test(end)) {
    return res.status(401).json({ message: 'start or end are in bad format, dates in format YYYY-mm-dd' });
  }
  insertSnapshotBetweenDate(start, end);
  return res.status(200).json({
    message: `insert snapshot beetween ${start} and ${end} has begun, list of tasks has been created on elastic'`,
  });
});

module.exports = router;
