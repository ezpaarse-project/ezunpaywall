/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const { Readable } = require('stream');
const axios = require('axios');
const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'download');

const {
  getState,
  updateStateInFile,
  addStepAskUnpaywall,
  addStepDownload,
  addStepInsert,
  fail,
} = require('./state');

/**
 * insert data on elastic with request
 * @param {Array} data array of unpaywall data
 * @param {string} index name of the index to which the data will be saved
 */
const insertUPW = async (data, index, stateName) => {
  let res;
  const body = data.flatMap((doc) => [{ index: { _index: index, _id: doc.doi } }, doc]);
  try {
    res = await client.bulk({ refresh: true, body });
  } catch (err) {
    logger.error(`insertUPW: ${err}`);
  }
  if (res?.body?.errors) {
    const { error } = res?.body?.items;
    error.forEach((e) => {
      logger.error(`insertUPW item : ${JSON.stringify(e)}`);
    });
    await fail(stateName);
  }
};

/**
 * Inserts the contents of an unpaywall data update file
 * @param {string} stateName - state filename
 * @param {string} filename - snapshot filename which the data will be inserted
 * @param {string} index name of the index to which the data will be saved
 * @param {object} opts - options containing a limit and an offset
 */
const insertDataUnpaywall = async (stateName, filename, index, opts) => {
  // step initiation in the state
  const start = new Date();
  await addStepInsert(stateName, filename);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];

  const filePath = path.resolve(downloadDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`fs.stat in insertDataUnpaywall: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`fs.createReadStream in insertDataUnpaywall: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }

  // get information "loaded" for state
  let loaded = 0;
  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  let decompressedStream;
  try {
    decompressedStream = readStream.pipe(zlib.createGunzip());
  } catch (err) {
    logger.error(`readStream.pipe(zlib.createGunzip()) in insertDataUnpaywall: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  // array that will contain the packet of 1000 unpaywall data
  let tab = [];

  // Reads line by line the output of the decompression stream to make packets of 1000
  // to insert them in bulk in an elastic
  for await (const line of rl) {
    // limit
    if (step.linesRead === opts.limit) {
      break;
    }

    step.linesRead += 1;

    // offset
    if (step.linesRead >= opts.offset + 1) {
      // fill the array
      try {
        tab.push(JSON.parse(line));
      } catch (err) {
        logger.error(`JSON.parse in insertDataUnpaywall: ${err}`);
        await fail(stateName);
        // TODO throw Error
      }
    }
    // bulk insertion
    if (tab.length % 1000 === 0 && tab.length !== 0) {
      await insertUPW(tab, index, stateName);
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      state.steps[state.steps.length - 1] = step;
      await updateStateInFile(state, stateName);
      tab = [];
    }
    if (step.linesRead % 100000 === 0) {
      logger.info(`${step.linesRead} Lines reads`);
    }
  }
  // last insertion if there is data left
  if (tab.length !== 0) {
    await insertUPW(tab, index, stateName);
    tab = [];
  }
  logger.info('step - end insertion');

  // last update of step
  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  step.percent = 100;
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, stateName);
};

/**
 * Update the step the percentage in download regularly until the download is complete
 * @param {string} filePath - path where the file is downloaded
 * @param {object} info - info of file
 * @param {string} stateName - state filename
 * @param {object} state - state in JSON format
 * @param {date} start - download start date
 */
async function updatePercentStepDownload(filePath, info, stateName, start) {
  const state = await getState(stateName);
  if (state.error) {
    return;
  }
  const step = state.steps[state.steps.length - 1];
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`fs.stat in updatePercentStepDownload: ${err}`);
  }
  if (bytes?.size >= info.size) {
    return;
  }
  step.took = (new Date() - start) / 1000;
  step.percent = ((bytes.size / info.size) * 100).toFixed(2);
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, stateName);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  updatePercentStepDownload(filePath, info, stateName, start);
}

/**
 * Start the download of the update file from unpaywall
 * @param {string} stateName - state filename
 * @param {string} info - information of the file to download
 */
const downloadFileFromUnpaywall = async (stateName, info) => {
  let stats;

  const filepath = path.resolve(downloadDir, info.filename);
  let alreadyInstalled;
  try {
    alreadyInstalled = await fs.pathExists(filepath);
  } catch (err) {
    logger.error(`fs.pathExists in downloadFileFromUnpaywall: ${err}`);
    await fail(stateName);
    // TODO thown Error;
  }

  if (alreadyInstalled) stats = await fs.stat(filepath);

  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === info.size) {
    logger.info('file already installed');
    return;
  }

  await addStepDownload(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  step.file = info.filename;

  let res;
  try {
    res = await axios({
      method: 'get',
      url: info.url,
      responseType: 'stream',
    });
  } catch (err) {
    logger.error(`axios in downloadFileFromUnpaywall: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }

  const filePath = path.resolve(downloadDir, info.filename);

  logger.info(`file : ${info.filename}`);
  logger.info(`lines : ${info.lines}`);
  logger.info(`size : ${info.size}`);
  logger.info(`to_date : ${info.to_date}`);

  if (res?.data instanceof Readable) {
    await new Promise((resolve, reject) => {
      // download unpaywall file with stream
      const writeStream = res.data.pipe(fs.createWriteStream(filePath));

      const start = new Date();
      // update the percentage of the download step in parallel
      updatePercentStepDownload(filePath, info, stateName, start);

      writeStream.on('finish', async () => {
        stats = await fs.stat(filepath);
        if (stats.size !== info.size) {
          await fail();
          return reject();
        }
        step.status = 'success';
        step.took = (new Date() - start) / 1000;
        step.percent = 100;
        state.steps[state.steps.length - 1] = step;
        await updateStateInFile(state, stateName);
        logger.info('step - end download');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        logger.error(`writeStream in downloadFileFromUnpaywall: ${err}`);
        await fail(stateName);
        return reject(err);
      });
    });
  } else {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(res.data);
    writeStream.end();
  }
};

/**
 * ask unpaywall to get information and download links for snapshots files
 * @param {string} stateName - state filename
 * @param {string} url - url to call for the list of update files
 * @param {date} startDate - start date of the period
 * @param {date} endDate - end date of the period
 * @returns {array<object>} information about snapshots files
 */
const askUnpaywall = async (stateName, url, startDate, endDate) => {
  const start = new Date();
  await addStepAskUnpaywall(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  let res;
  try {
    res = await axios({
      method: 'get',
      url,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    logger.error(`axios in askUnpaywall: ${err}`);
    // TODO thow error
  }

  if (res?.status !== 200 || !res?.data?.list?.length) {
    // TODO thow error
  }

  let snapshotsInfo = res.data.list;
  snapshotsInfo = snapshotsInfo
    .reverse()
    .filter((file) => file.filetype === 'jsonl')
    .filter((file) => new Date(file.to_date).getTime() >= new Date(startDate).getTime())
    .filter((file) => new Date(file.to_date).getTime() <= new Date(endDate).getTime());

  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  await updateStateInFile(state, stateName);
  logger.info('step - end ask unpaywall');
  return snapshotsInfo;
};

module.exports = {
  insertDataUnpaywall,
  downloadFileFromUnpaywall,
  askUnpaywall,
};
