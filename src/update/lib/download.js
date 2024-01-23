const path = require('path');
const fs = require('fs-extra');
const { Readable } = require('stream');
const { format } = require('date-fns');
const { setTimeout } = require('node:timers/promises');
const logger = require('./logger');

const {
  getState,
  getLatestStep,
  addStepDownload,
  fail,
  updateLatestStep,
} = require('./state');

const {
  getSnapshot,
  getChangefile,
} = require('./services/unpaywall');

const pathDir = require('./path');

/**
 * Update the step the percentage in download regularly until the download is complete.
 *
 * @param {string} filepath - Path where the file is downloaded.
 * @param {number} size - Size of file.
 * @param {number} start - Download start date.
 *
 * @returns {Promise<void>}
 */
async function updatePercentStepDownload(filepath, size, start) {
  const state = getState();
  if (state.error) {
    return;
  }
  const step = getLatestStep();
  logger.debug(`[job][download]: Percent of step: ${step.percent}`);
  let bytes;
  try {
    bytes = await fs.stat(filepath);
  } catch (err) {
    logger.error(`[job][download] Cannot stat [${filepath}]`, err);
    return;
  }
  if (bytes?.size >= size) {
    return;
  }
  step.took = (new Date() - start) / 1000;
  step.percent = ((bytes.size / size) * 100).toFixed(2);
  updateLatestStep(step);
  await setTimeout(1000);
  updatePercentStepDownload(filepath, size, start);
}

/**
 * Download file
 *
 * @param {Readable} file - File.
 * @param {string} filepath - Filepath of file.
 * @param {number} size - Size of file.
 *
 * @returns {Promise<void>}
 */
async function download(file, filepath, size) {
  const step = getLatestStep();
  if (file instanceof Readable) {
    await new Promise((resolve, reject) => {
      // download unpaywall file with stream
      const writeStream = file.pipe(fs.createWriteStream(filepath));

      const start = new Date();
      writeStream.on('ready', async () => {
        // update the percentage of the download step in parallel
        updatePercentStepDownload(filepath, size, start);
      });

      writeStream.on('finish', async () => {
        step.status = 'success';
        step.took = (new Date() - start) / 1000;
        step.percent = 100;
        updateLatestStep(step);
        logger.info('[job: download] File download completed');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        logger.error('[job: download] Error on stream', err);
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
 * @param {string} info - Information of the file to download.
 * @param {string} interval - Type of changefile (day or week).
 *
 * @returns {Promise<boolean>} success or not
 */
async function downloadChangefile(info, interval) {
  let stats;

  const filePath = path.resolve(pathDir.snapshotsDir, info.filename);

  const alreadyInstalled = await fs.pathExists(filePath);
  if (alreadyInstalled) stats = await fs.stat(filePath);
  if (alreadyInstalled && stats.size === info.size) {
    logger.info(`[job: download] File [${info.filename}] is already installed`);
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

  await download(changefile, filePath, size);
  return true;
}

/**
 * Start the download of the big snapshot from unpaywall.
 *
 * @returns {Promise<string>} filename of snapshot
 */
async function downloadBigSnapshot() {
  const filename = `snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`;
  const filepath = path.resolve(pathDir.snapshotsDir, filename);

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
}

module.exports = {
  downloadChangefile,
  downloadBigSnapshot,
};
