const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const { Readable } = require('stream');
const axios = require('../../lib/axios');
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
 * @param {*} data array of unpaywall data
 */
const insertUPW = async (data) => {
  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall', _id: doc.doi } }, doc]);
  try {
    await client.bulk({ refresh: true, body });
  } catch (err) {
    logger.error(`insertUPW: ${err}`);
  }
};

const insertDataUnpaywall = async (stateName, opts, filename) => {
  const start = new Date();
  await addStepInsert(stateName, filename);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];

  const filePath = path.resolve(downloadDir, filename);

  let loaded = 0;
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`fs.stat in insertDataUnpaywall: ${err}`);
  }

  const insertion = async () => {
    // read file with stream
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger.error(`fs.createReadStream in insertDataUnpaywall: ${err}`);
      await fail();
      return null;
    }

    readStream.on('data', (chunk) => {
      loaded += chunk.length;
    });

    let decompressedStream;

    try {
      decompressedStream = readStream.pipe(zlib.createGunzip());
    } catch (err) {
      logger.error(`readStream.pipe(zlib.createGunzip()) in insertDataUnpaywall: ${err}`);
      await fail();
      return null;
    }

    let tab = [];

    const rl = readline.createInterface({
      input: decompressedStream,
      crlfDelay: Infinity,
    });

    // read line by line and sort by pack of 1000
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      // limit
      if (step.linesRead === opts.limit) {
        break;
      }

      step.linesRead += 1;

      // offset
      if (step.linesRead >= opts.offset + 1) {
        const res = JSON.parse(line);
        await fs.appendFile(`${downloadDir}/doi.csv`, `${res.doi}\r`, (err) => {
          if (err) throw err;
        });
        // fill the array
        try {
          tab.push(JSON.parse(line));
        } catch (err) {
          logger.error(`JSON.parse in insertDataUnpaywall: ${err}`);
          await fail();
          return null;
        }
      }
      // bulk insertion
      if (tab.length % 1000 === 0 && tab.length !== 0) {
        await insertUPW(tab);
        step.percent = ((loaded / bytes.size) * 100).toFixed(2);
        step.took = (new Date() - start) / 1000;
        state.steps[state.steps.length - 1] = step
        await updateStateInFile(state, stateName);
        tab = [];
      }
      if (step.linesRead % 100000 === 0) {
        logger.info(`${step.linesRead} Lines reads`);
      }
    }
    // if have stays data to insert
    if (tab.length !== 0) {
      await insertUPW(tab);
      tab = [];
    }
    logger.info('step - end insertion');
    step.status = 'success';
    step.took = (new Date() - start) / 1000;
    return true;
  };
  await insertion();
  step.percent = 100;
  state.steps[state.steps.length - 1] = step
  await updateStateInFile(state, stateName);
  return true;
};

/**
 * download the snapshot
 */
const downloadUpdateSnapshot = async (stateName, info) => {
  const start = new Date();
  await addStepDownload(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];

  let stats;

  const file = path.resolve(downloadDir, info.filename);
  let alreadyInstalled;
  try {
    alreadyInstalled = await fs.pathExists(file);
  } catch (err) {
    logger.error(`fs.pathExists in downloadUpdateSnapshot: ${err}`);
  }

  if (alreadyInstalled) stats = fs.statSync(file);

  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === info.size) {
    logger.info('file already installed');
    return true;
  }

  let compressedFile;
  try {
    compressedFile = await axios({
      method: 'get',
      url: info.url,
      responseType: 'stream',
    });
  } catch (err) {
    logger.error(`axios in downloadUpdateSnapshot: ${err}`);
    await fail();
    return null;
  }

  const downloadFileWithStream = async (filePath) => new Promise((resolve, reject) => {
    // download unpaywall file with stream
    const writeStream = compressedFile.data.pipe(fs.createWriteStream(filePath));

    // update percent of download
    let timeout;
    (async function percentDownload() {
      let bytes;
      try {
        bytes = await fs.stat(filePath);
      } catch (err) {
        logger.error(`fs.stat in percentDownload: ${err}`);
      }
      if (bytes.size === info.size) {
        clearTimeout(timeout);
        return;
      }
      step.took = (new Date() - start) / 1000;
      step.percent = ((bytes.size / info.size) * 100).toFixed(2);
      state.steps[state.steps.length - 1] = step
      await updateStateInFile(state, stateName);
      timeout = setTimeout(percentDownload, 3000);
    }());

    writeStream.on('finish', async () => {
      step.status = 'success';
      step.took = (new Date() - start) / 1000;
      step.percent = 100;
      state.steps[state.steps.length - 1] = step
      await updateStateInFile(state, stateName);
      clearTimeout(timeout);
      logger.info('step - end download');
      return resolve();
    });

    writeStream.on('error', async (err) => {
      logger.error(`writeStream in percentDownload: ${err}`);
      await fail();
      return reject(err);
    });
  });

  const filePath = path.resolve(downloadDir, info.filename);

  logger.info(`file : ${info.filename}`);
  logger.info(`lines : ${info.lines}`);
  logger.info(`size : ${info.size}`);
  logger.info(`to_date : ${info.to_date}`);

  if (compressedFile?.data instanceof Readable) {
    await downloadFileWithStream(filePath);
  } else {
    const writeStream = fs.createWriteStream(filePath);
    writeStream.write(compressedFile.data);
    writeStream.end();
  }
  return true;
};

/**
 * ask unpaywall to get getMetadata() on unpaywall snapshot
 */
const askUnpaywall = async (url, stateName, startDate, endDate) => {
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
    return null;
  }

  if (res?.status !== 200 || !res?.data?.list?.length) {
    return null;
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
  downloadUpdateSnapshot,
  askUnpaywall,
};
