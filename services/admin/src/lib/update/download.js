const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const { Readable } = require('stream');
const { format } = require('date-fns');
const { setTimeout } = require('node:timers/promises');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');

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
} = require('../unpaywall/api');

/**
 * Update the step the percentage in download regularly until the download is complete.
 *
 * @param {string} filepath Path where the file is downloaded.
 * @param {number} size Size of file.
 * @param {number} start Download start date.
 *
 * @returns {Promise<void>}
 */
async function updatePercentStepDownload(filepath, size, start) {
  const state = getState();
  if (state.error || state.done) {
    return;
  }
  const step = getLatestStep();
  appLogger.debug(`[job][download]: Download [${filepath}] - ${step.percent}%`);
  let bytes;
  try {
    bytes = await fsp.stat(filepath);
  } catch (err) {
    appLogger.error(`[job][download]: Cannot stat [${filepath}]`, err);
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
 * @param {Readable} file File.
 * @param {string} filepath Filepath of file.
 * @param {number} size Size of file.
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
        appLogger.info('[job][download]: File download completed');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        appLogger.error('[job][download]: Error on stream', err);
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
 * @param {string} info Information of the file to download.
 * @param {string} interval Type of changefile (day or week).
 *
 * @returns {Promise<boolean>} success or not
 */
async function downloadChangefile(info, interval) {
  let stats;

  const filePath = path.resolve(paths.data.changefilesDir, info.filename);

  const alreadyInstalled = await fs.existsSync(filePath);
  if (alreadyInstalled) stats = await fsp.stat(filePath);
  if (alreadyInstalled && stats.size === info.size) {
    appLogger.info(`[job][download]: File [${info.filename}] is already installed`);
    return true;
  }

  addStepDownload();
  const step = getLatestStep();
  step.file = info.filename;
  updateLatestStep(step);

  const res = await getChangefile(info.filename, interval);

  if (!res) {
    appLogger.error(`[unpaywall][changefile]: Cannot get changefile [${info.filename}]`);
    throw new Error(`[unpaywall][changefile]: Cannot get changefile [${info.filename}]`);
  }

  const changefile = res.data;
  const { size } = info;

  try {
    await download(changefile, filePath, size);
  } catch (err) {
    appLogger.error(`[unpaywall][changefile]: Cannot download changefile [${info.filename}]`);
    throw new Error(`[unpaywall][changefile]: Cannot download changefile [${info.filename}]`);
  }

  return true;
}

/**
 * Start the download of the big snapshot from unpaywall.
 *
 * @returns {Promise<string>} filename of snapshot
 */
async function downloadSnapshot() {
  const filename = `snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`;
  const filepath = path.resolve(paths.data.snapshotsDir, filename);

  addStepDownload();
  const step = getLatestStep();
  step.file = filename;
  updateLatestStep(step);

  const res = await getSnapshot();
  if (!res) { throw new Error('[unpaywall]: Cannot get snapshot'); }

  const snapshot = res.data;
  const size = res.headers['content-length'];

  await download(snapshot, filepath, size);
  return filename;
}

module.exports = {
  downloadChangefile,
  downloadSnapshot,
};
