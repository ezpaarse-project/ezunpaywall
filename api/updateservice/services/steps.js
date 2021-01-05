const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const axios = require('axios');
const zlib = require('zlib');
const Papa = require('papaparse');
const { Readable } = require('stream');
const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');

const {
  task,
  getMetadatas,
  getIteratorFile,
  createStepInsert,
  createStepFetchUnpaywall,
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
    logger.error(`Error in insertUPW: ${err}`);
  }
};

/**
 * @param {*} data array of unpaywall datas
 */
const insertHLM = async (data) => {
  const body = data.flatMap((doc) => [{ index: { _index: 'etatcollhlm' } }, doc]);
  try {
    await client.bulk({ refresh: true, body });
  } catch (err) {
    logger.error(`Error in insertHLM: ${err}`);
  }
};

const insertDatasHLM = async (filename) => {
  const filePath = path.resolve(downloadDir, filename);
  let readStream;
  let tab = [];
  let data;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`Error in readstream in insertDatasHLM: ${err}`);
  }
  await new Promise((resolve) => {
    Papa.parse(readStream, {
      delimiter: ',',
      header: true,
      step: async (results, parser) => {
        data = results.data;
        for (const attr in data) {
          if (data[`${attr}`] === '') {
            delete data[`${attr}`];
          }
        }
        tab.push(data);
        if (tab.length === 100) {
          await parser.pause();
          await insertHLM(tab);
          tab = [];
          await parser.resume();
        }
      },
      complete: () => resolve(),
    });
  });
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
    logger.error(`Error in fs.stat in insertDatasUnpaywall: ${err}`);
  }

  const insertion = async () => {
    // read file with stream

    let readStream;

    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      logger.error(`Error in fs.createReadStream in insertDatasUnpaywall: ${err}`);
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
      logger.error(`Error in readStream.pipe(zlib.createGunzip()) in insertDatasUnpaywall: ${err}`);
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
      if (step.lineRead === options.limit) {
        break;
      }

      step.lineRead += 1;

      // offset
      if (step.lineRead >= options.offset + 1) {
        // fill the array
        try {
          tab.push(JSON.parse(line));
        } catch (err) {
          logger.error(`Error in JSON.parse in insertDatasUnpaywall: ${err}`);
          await fail(start);
          return null;
        }
      }
      // bulk insertion
      if (tab.length % 1000 === 0 && tab.length !== 0) {
        await insertUPW(tab);
        step.percent = ((loaded / bytes.size) * 100).toFixed(2);
        tab = [];
      }
      if (step?.lineRead % 100000 === 0) {
        logger.info(`${step.lineRead}th Lines reads`);
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
    logger.error(`Error in fs.pathExists in downloadUpdateSnapshot: ${err}`);
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
    logger.error(`Error in axios in downloadUpdateSnapshot: ${err}`);
    await fail(start);
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
        logger.error(`Error in fs.stat in percentDownload: ${err}`);
      }
      if (bytes.size === size) {
        clearTimeout(timeout);
        return;
      }
      task.steps[task.steps.length - 1].percent = ((bytes.size / size) * 100).toFixed(2);
      timeout = setTimeout(percentDownload, 3000);
    }());

    writeStream.on('finish', () => {
      task.steps[task.steps.length - 1].status = 'success';
      task.steps[task.steps.length - 1].took = (new Date() - start) / 1000;
      task.steps[task.steps.length - 1].percent = 100;
      clearTimeout(timeout);
      logger.info('step - end download');
      return resolve();
    });

    writeStream.on('error', async (err) => {
      logger.error(`Error in writeStream in percentDownload: ${err}`);
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

  // FIXME with text, axios return a String and not a Readable
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
const fetchUnpaywall = async (url, startDate, endDate) => {
  // create step fetchUnpaywall
  const start = createStepFetchUnpaywall();

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
    logger.error(`Error in axios in fetchUnpaywall: ${err}`);
    await fail(start);
    return null;
  }

  if (response?.status !== 200) {
    await fail(start);
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

  const step = task.steps[task.steps.length - 1];

  step.status = 'success';
  step.took = (new Date() - start) / 1000;

  logger.info('step - end fetch unpaywall ');

  return true;
};

module.exports = {
  insertDatasUnpaywall,
  insertDatasHLM,
  downloadUpdateSnapshot,
  fetchUnpaywall,
};
