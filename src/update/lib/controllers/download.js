const path = require('path');
const fs = require('fs-extra');
const { Readable } = require('stream');
const { format } = require('date-fns');
const logger = require('../logger');

const {
  getState,
  getLatestStep,
  addStepDownload,
  fail,
  updateLatestStep,
} = require('../models/state');

const {
  getSnapshot,
  getChangefile,
} = require('../services/unpaywall');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

/**
 * Update the step the percentage in download regularly until the download is complete.
 *
 * @param {String} filepath - Path where the file is downloaded.
 * @param {Number} size - Size of file.
 * @param {Date} start - Download start date.
 */
async function updatePercentStepDownload(filepath, size, start) {
  const state = getState();
  if (state.error) {
    return;
  }
  const step = getLatestStep();
  let bytes;
  try {
    bytes = await fs.stat(filepath);
  } catch (err) {
    logger.error(`Cannot stat ${filepath}`);
    logger.error(err);
    return;
  }
  if (bytes?.size >= size) {
    return;
  }
  step.took = (new Date() - start) / 1000;
  step.percent = ((bytes.size / size) * 100).toFixed(2);
  updateLatestStep(step);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  updatePercentStepDownload(filepath, size, start);
}

/**
 * Download file
 *
 * @param {Readable} file - File.
 * @param {String} filepath - Filepath of file.
 * @param {Number} size - Size of file.
 */
async function download(file, filepath, size) {
  const step = getLatestStep();
  if (file instanceof Readable) {
    await new Promise((resolve, reject) => {
      // download unpaywall file with stream
      const writeStream = file.pipe(fs.createWriteStream(filepath));

      const start = new Date();
      // update the percentage of the download step in parallel
      updatePercentStepDownload(filepath, size, start);

      writeStream.on('finish', async () => {
        step.status = 'success';
        step.took = (new Date() - start) / 1000;
        step.percent = 100;
        updateLatestStep(step);
        logger.info('step - end download');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        logger.error(err);
        await fail(err);
        return reject(err);
      });
    });
  } else {
    const writeStream = await fs.createWriteStream(filepath);
    writeStream.write(file);
    writeStream.end();
  }
}

/**
 * Start the download of the changefile from unpaywall.
 *
 * @param {String} info - Information of the file to download.
 * @param {String} interval - Type of changefile (day or week).
 */
const downloadChangefile = async (info, interval) => {
  let stats;

  const filepath = path.resolve(snapshotsDir, info.filename);

  const alreadyInstalled = await fs.pathExists(filepath);
  if (alreadyInstalled) stats = await fs.stat(filepath);
  if (alreadyInstalled && stats.size === info.size) {
    logger.info(`File "${info.filename}"" already installed`);
    return true;
  }

  addStepDownload();
  const step = getLatestStep();
  step.file = info.filename;
  updateLatestStep(step);

  const res = await getChangefile(info.filename, interval);

  if (!res) {
    await fail();
    return false;
  }

  if (!res) { return false; }

  const changefile = res.data;
  const { size } = info;

  await download(changefile, filepath, size);
  return true;
};

/**
 * Start the download of the big snapshot from unpaywall.
 *
 * @param {String} info - Information of the snapshot to download.
 */
const downloadBigSnapshot = async () => {
  const filename = `snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`;
  const filepath = path.resolve(snapshotsDir, filename);

  addStepDownload();
  const step = getLatestStep();
  step.file = filename;
  updateLatestStep(step);

  const res = await getSnapshot();
  if (!res) return false;

  const snapshot = res.data;
  const size = res.headers['content-length'];

  await download(snapshot, filepath, size);
  return filename;
};

module.exports = {
  downloadChangefile,
  downloadBigSnapshot,
};
