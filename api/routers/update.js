const router = require('express').Router();
const fs = require('fs-extra');
const path = require('path');
const config = require('config');

const updateDir = path.resolve(__dirname, '..', 'out', 'update', 'download');
const stateDir = path.resolve(__dirname, '..', 'out', 'update', 'state');
const reportDir = path.resolve(__dirname, '..', 'out', 'update', 'report');

const multer = require('multer');

const storage = multer.diskStorage(
  {
    destination: updateDir,
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  },
);

const upload = multer({ storage });

const url = `${config.get('unpaywallURL')}?api_key=${config.get('apikey')}`;

const {
  insertion,
  insertSnapshotBetweenDates,
} = require('../services/update/utils');

const {
  getStatus,
} = require('../services/update/status');

const {
  getState,
} = require('../services/update/state');

const {
  getReport,
} = require('../services/update/report');

const {
  deleteSnapshot,
} = require('../services/update/snapshot');

/**
 * get the files in a dir in order by date
 * @param {string} dir - dir path
 * @returns {array<string>} files path in order
 */
const orderReccentFiles = (dir) => fs.readdirSync(dir)
  .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
  .map((file) => ({ file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
  .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

/**
 * get the most recent file in a dir
 * @param {string} dir - dir path
 * @returns {string} most recent file path
 */
const getMostRecentFile = async (dir) => {
  const files = await orderReccentFiles(dir);
  return files.length ? files[0] : undefined;
};

/**
 * gets the status if an update is in progress
 *
 * @apiSuccess status
 */
router.get('/update/status', (req, res) => res.status(200).json({ inUpdate: getStatus() }));

router.post('/update/snapshot', upload.single('file'), async (req, res) => {
  if (!req?.file) {
    return res.status(500).json({ messsage: 'internal server error' });
  }
  return res.status(200).json({ messsage: 'file added' });
});

router.delete('/update/snapshot/:filename', async (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(updateDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  await deleteSnapshot(filename);
  return res.status(200).json({ messsage: `${filename} deleted` });
});

/**
 * middleware that blocks simultaneous updates of unpaywall data
 *
 * @apiError 409 update in progress
 */
router.use((req, res, next) => {
  const status = getStatus();
  if (status) {
    return res.status(409).json({
      message: 'update in progress',
    });
  }
  return next();
});

/**
 * Insert the content of files that the
 * server has already downloaded (file in .gz format).
 * offset and limit are the variables to designate
 * from which line to insert and from which line to stop.
 *
 * @apiParam QUERRY offset - first line insertion, by default, we start with the first
 * @apiParam QUERRY limit - last line insertion by default, we have no limit
 * @apiParam PARAMS filename - filename
 *
 * @apiSuccess {string} message informing the start of the process
 *
 * @apiError 400 name of snapshot file expected
 * @apiError 400 filename is in bad format (accepted [a-zA-Z0-9_.-] patern)
 * @apiError 400 limit can't be lower than offset or 0
 * @apiError 404 file not found
 *
 */
router.post('/update/:filename', async (req, res) => {
  const { filename } = req.params;
  let { offset, limit } = req.query;
  if (!filename) {
    return res.status(400).json({ message: 'filename of snapshot file expected' });
  }
  const pattern = /^[a-zA-Z0-9_.-]+(.gz)$/;
  if (!pattern.test(filename)) {
    return res.status(400).json({ message: 'filename of file is in bad format (accepted a .gz file)' });
  }
  const fileExist = await fs.pathExists(path.resolve(updateDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  if (Number(limit) <= Number(offset)) {
    return res.status(400).json({ message: 'limit can\t be lower than offset or 0' });
  }

  if (!offset) { offset = 0; }
  if (!limit) { limit = -1; }
  insertion(filename, { offset: Number(offset), limit: Number(limit) });
  return res.status(200).json({
    message: `start upsert with ${filename}`,
  });
});

/**
 *
 * Downloads update files offered by unpaywall.
 * - If there are no `start` and` end` attributes, It will execute
 * the download and the insertion of the most recent update file.
 *
 * - If there are the `start` and` end` attributes, It will execute
 * the download and the insertion of the update files between the given period.
 *
 * - If there is the `start` attribute, It will execute the download and
 * the insertion of the update files between the` start` date and the current date.
 *
 * @apiParam QUERY startDate - start date at format YYYY-mm-dd
 * @apiParam QUERY endDate - end date at format YYYY-mm-dd
 *
 * @apiSuccess message informing the start of the process
 *
 * @apiError 400 start date is missing
 * @apiError 400 end date is lower than start date
 * @apiError 400 start date or end are date in bad format, dates in format YYYY-mm-dd
 */
router.post('/update', (req, res) => {
  let { startDate } = req.query;
  let { endDate } = req.query;
  if (!startDate && !endDate) {
    endDate = Date.now();
    startDate = endDate - (7 * 24 * 60 * 60 * 1000);
    insertSnapshotBetweenDates(url, startDate, endDate);
    return res.status(200).json({
      message: 'weekly update has begun, list of task has been created on elastic',
    });
  }
  if (new Date(startDate).getTime() > Date.now()) {
    return res.status(400).json({ message: 'startDate is in the futur' });
  }

  if (endDate && !startDate) {
    return res.status(400).json({
      message: 'start date is missing',
    });
  }
  if (startDate && endDate) {
    if (new Date(endDate).getTime() < new Date(startDate).getTime()) {
      return res.status(400).json({ message: 'endDate is lower than startDate' });
    }
  }
  const pattern = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  if (startDate && !pattern.test(startDate)) {
    return res.status(400).json({ message: 'startDate are in bad format, date need to be in format YYYY-mm-dd' });
  }
  if (endDate && !pattern.test(endDate)) {
    return res.status(400).json({ message: 'endDate are in bad format, date need to be in format format YYYY-mm-dd' });
  }
  if (startDate && !endDate) {
    [endDate] = new Date().toISOString().split('T');
  }
  insertSnapshotBetweenDates(url, startDate, endDate);
  return res.status(200).json({
    message: `insert snapshot beetween ${startDate} and ${endDate} has begun, list of task has been created on elastic`,
  });
});

/**
 * get the most recent state in JSON format
 * @apiSuccess state
 */
router.get('/update/state', async (req, res) => {
  const latestFile = await getMostRecentFile(stateDir);
  const state = await getState(latestFile?.file);
  res.status(200).json({ state });
});

/**
 * get state in JSON format
 *
 * @apiError 400 filename expected
 * @apiError 404 file not found
 *
 * @apiSuccess state
 */
router.get('/update/state/:filename', async (req, res) => {
  const { filename } = req.params;
  if (!filename) {
    return res.status(400).json({ message: 'filename expected' });
  }
  const fileExist = await fs.pathExists(path.resolve(updateDir, filename));
  if (!fileExist) {
    return res.status(404).json({ message: 'file not found' });
  }
  const state = await getState(filename);
  return res.status(200).json({ state });
});

/**
 * get the most recent report in JSON format
 *
 * @apiSuccess report
 */
router.get('/update/report', async (req, res) => {
  // TODO use param filename and query latest
  const latestFile = await getMostRecentFile(reportDir);
  const report = await getReport(latestFile?.file);
  res.status(200).json({ report });
});

module.exports = router;
