const path = require('path');
const fs = require('fs-extra');
const { Readable } = require('stream');
const { format } = require('date-fns');
const logger = require('../lib/logger');

const {
  getState,
  updateStateInFile,
  addStepDownload,
  fail,
} = require('./state');

const {
  getSnapshot,
  getChangefile,
} = require('./unpaywall');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

/**
 * Update the step the percentage in download regularly until the download is complete
 * @param {String} filepath - path where the file is downloaded
 * @param {Object} size - size of file
 * @param {String} stateName - state filename
 * @param {Object} state - state in JSON format
 * @param {Date} start - download start date
 */
async function updatePercentStepDownload(filepath, size, stateName, start) {
  const state = await getState(stateName);
  if (state.error) {
    return;
  }
  const step = state.steps[state.steps.length - 1];
  let bytes;
  try {
    bytes = await fs.stat(filepath);
  } catch (err) {
    logger.error(`Cannot stat ${filepath}`);
    logger.error(err);
  }
  if (bytes?.size >= size) {
    return;
  }
  step.took = (new Date() - start) / 1000;
  step.percent = ((bytes.size / size) * 100).toFixed(2);
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, stateName);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  updatePercentStepDownload(filepath, size, stateName, start);
}

const download = async (file, filepath, size, stateName) => {
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  if (file instanceof Readable) {
    await new Promise((resolve, reject) => {
      // download unpaywall file with stream
      const writeStream = file.pipe(fs.createWriteStream(filepath));

      const start = new Date();
      // update the percentage of the download step in parallel
      updatePercentStepDownload(filepath, size, stateName, start);

      writeStream.on('finish', async () => {
        step.status = 'success';
        step.took = (new Date() - start) / 1000;
        step.percent = 100;
        state.steps[state.steps.length - 1] = step;
        await updateStateInFile(state, stateName);
        logger.info('step - end download');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        logger.error(err);
        await fail(stateName, err);
        return reject(err);
      });
    });
  } else {
    const writeStream = await fs.createWriteStream(filepath);
    writeStream.write(file);
    writeStream.end();
  }
};

/**
 * Start the download of the update file from unpaywall
 * @param {String} stateName - state filename
 * @param {String} info - information of the file to download
 */
const downloadChangefile = async (stateName, info) => {
  let stats;

  const filepath = path.resolve(snapshotsDir, info.filename);

  const alreadyInstalled = await fs.pathExists(filepath);
  if (alreadyInstalled) stats = await fs.stat(filepath);
  if (alreadyInstalled && stats.size === info.size) {
    logger.info(`File "${info.filename}"" already installed`);
    return true;
  }

  await addStepDownload(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  step.file = info.filename;
  await updateStateInFile(state, stateName);

  const res = await getChangefile(info.filename);
  if (!res) {
    return false;
  }

  const changefile = res.data;
  const { size } = info;

  await download(changefile, filepath, size, stateName);
  return true;
};

/**
 * Start the download of the big file from unpaywall
 * @param {String} stateName - state filename
 * @param {String} info - information of the file to download
 */
const downloadBigSnapshot = async (stateName) => {
  const filename = `snapshot-${format(new Date(), 'yyyy-MM-dd')}.jsonl.gz`;
  const filepath = path.resolve(snapshotsDir, filename);

  await addStepDownload(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  step.file = filename;
  await updateStateInFile(state, stateName);

  const res = await getSnapshot();

  const snapshot = res.data;
  const size = res.headers['content-length'];

  await download(snapshot, filepath, size, stateName);
  return filename;
};

module.exports = {
  downloadChangefile,
  downloadBigSnapshot,
};