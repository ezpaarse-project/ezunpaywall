const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const axios = require('axios');
const zlib = require('zlib');
const { Readable } = require('stream');
const client = require('../lib/client');
const { logger } = require('../lib/logger');

const downloadDir = path.resolve(__dirname, '..', 'out', 'download');

const {
  task,
  getMetadatas,
  getIteratorFile,
  createStepInsert,
  createStepaskUnpaywall,
  createStepDownload,
  fail,
} = require('./status');

/**
 * @param {*} data array of unpaywall datas
 */
const insertUPW = async (data) => {
  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall', _id: doc.doi } }, doc]);
  try {
    await client.bulk({ refresh: true, body });
  } catch (err) {
    logger.error(`insertUPW: ${err}`);
  }
};

const insertDatasUnpaywall = async (options) => {
  const metadata = getMetadatas();
  const interatorFile = getIteratorFile();
  const { filename } = metadata[interatorFile];

  const start = createStepInsert(filename);

  const filePath = path.resolve(downloadDir, filename);
  const step = task.steps[task.steps.length - 1];

  let loaded = 0;
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`fs.stat in insertDatasUnpaywall: ${err}`);
  }

  const insertion = async () => {
    // read file with stream
    let readStream;
    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger.error(`fs.createReadStream in insertDatasUnpaywall: ${err}`);
      await fail(start);
      return null;
    }

    readStream.on('data', (chunk) => {
      loaded += chunk.length;
    });

    let decompressedStream;

    try {
      decompressedStream = readStream.pipe(zlib.createGunzip());
    } catch (err) {
      logger.error(`readStream.pipe(zlib.createGunzip()) in insertDatasUnpaywall: ${err}`);
      await fail(start);
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
      if (step.linesRead === options.limit) {
        break;
      }

      step.linesRead += 1;

      // offset
      if (step.linesRead >= options.offset + 1) {
        const tes = JSON.parse(line);
        await fs.appendFile(`${downloadDir}/doi.csv`, `${tes.doi}\r`, (err) => {
          if (err) throw err;
        });
        // fill the array
        try {
          tab.push(JSON.parse(line));
        } catch (err) {
          logger.error(`JSON.parse in insertDatasUnpaywall: ${err}`);
          await fail(start);
          return null;
        }
      }
      // bulk insertion
      if (tab.length % 1000 === 0 && tab.length !== 0) {
        await insertUPW(tab);
        step.percent = ((loaded / bytes.size) * 100).toFixed(2);
        step.took = Math.round((new Date() - start) / 1000);
        tab = [];
      }
      if (step?.linesRead % 100000 === 0) {
        logger.info(`${step.linesRead}th Lines reads`);
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
  return true;
};

/**
 * download the snapshot
 */
const downloadUpdateSnapshot = async () => {
  let stats;

  const metadata = getMetadatas();
  const interatorFile = getIteratorFile();

  const {
    size,
    filename,
    filetype,
    lines,
    url,
    to_date: toDate,
  } = metadata[interatorFile];

  const file = path.resolve(downloadDir, filename);
  let alreadyInstalled;
  try {
    alreadyInstalled = await fs.pathExists(file);
  } catch (err) {
    logger.error(`fs.pathExists in downloadUpdateSnapshot: ${err}`);
  }

  if (alreadyInstalled) stats = fs.statSync(file);

  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === size) {
    logger.info('file already installed');
    return true;
  }

  // create step download
  const start = createStepDownload(filename);
  let compressedFile;
  try {
    compressedFile = await axios({
      method: 'get',
      url,
      responseType: 'stream',
    });
  } catch (err) {
    logger.error(`axios in downloadUpdateSnapshot: ${err}`);
    await fail(start);
    return null;
  }

  const downloadFileWithStream = async (filePath) => new Promise((resolve, reject) => {
    // download unpaywall file with stream
    const writeStream = compressedFile.data.pipe(fs.createWriteStream(filePath));
    const step = task.steps[task.steps.length - 1]

    // update percent of download
    let timeout;
    (async function percentDownload() {
      let bytes;
      try {
        bytes = await fs.stat(filePath);
      } catch (err) {
        logger.error(`fs.stat in percentDownload: ${err}`);
      }
      if (bytes.size === size) {
        clearTimeout(timeout);
        return;
      }
      step.took = Math.round((new Date() - start) / 1000);
      step.percent = ((bytes.size / size) * 100).toFixed(2);
      timeout = setTimeout(percentDownload, 3000);
    }());

    writeStream.on('finish', () => {
      step.status = 'success';
      step.took = Math.round((new Date() - start) / 1000);
      step.percent = 100;
      clearTimeout(timeout);
      logger.info('step - end download');
      return resolve();
    });

    writeStream.on('error', async (err) => {
      logger.error(`writeStream in percentDownload: ${err}`);
      await fail(start);
      return reject(err);
    });
  });

  const filePath = path.resolve(downloadDir, filename);

  logger.info(`Download update snapshot : ${filename}`);
  logger.info(`filetype : ${filetype}`);
  logger.info(`lines : ${lines}`);
  logger.info(`size : ${size}`);
  logger.info(`to_date : ${toDate}`);

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
 * ask unpaywall to get getMetadatas() on unpaywall snapshot
 */
const askUnpaywall = async (url, startDate, endDate) => {
  // create step askUnpaywall
  const start = createStepaskUnpaywall();
  const step = task.steps[task.steps.length - 1];

  let response;

  try {
    response = await axios({
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

  if (response?.status !== 200) {
    return null;
  }
  if (!response?.data?.list?.length) {
    return true;
  }

  response.data.list.reverse().forEach((file) => {
    if (file?.filetype !== 'jsonl') { return; }

    const fileDate = new Date(file.to_date).getTime();

    if (fileDate >= new Date(startDate).getTime() && fileDate <= new Date(endDate).getTime()) {
      getMetadatas().push(file);
    }
  });

  step.status = 'success';
  step.took = (new Date() - start) / 1000;

  logger.info('step - end ask unpaywall ');

  return true;
};

module.exports = {
  insertDatasUnpaywall,
  downloadUpdateSnapshot,
  askUnpaywall,
};
