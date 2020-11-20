const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const axios = require('axios');
const zlib = require('zlib');
const { Readable } = require('stream');
const client = require('../../lib/client');
const { processLogger } = require('../../lib/logger');

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
    console.log(err);
    processLogger.error(err);
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
    processLogger.error(err);
  }

  const insertion = async () => {
    // read file with stream

    let readStream;

    try {
      readStream = fs.createReadStream(filePath);
    } catch (err) {
      processLogger.error(err);
      return null;
    }

    readStream.on('data', (chunk) => {
      loaded += chunk.length;
    });

    let decompressedStream;

    try {
      decompressedStream = readStream.pipe(zlib.createGunzip());
    } catch (err) {
      processLogger.error(err);
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
      step.lineRead += 1;
      // limit
      if (step.lineRead <= options.limit) {
        break;
      }

      // offset
      if (step.lineRead >= options.offset) {
        // fill the array
        try {
          tab.push(JSON.parse(line));
        } catch (err) {
          processLogger.error(err);
          fail();
        }
      }
      // bulk insertion
      if (tab.length % 1000 === 0) {
        await insertUPW(tab);
        step.percent = ((loaded / bytes.size) * 100).toFixed(2);
        tab = [];
      }
      if (step?.lineRead % 100000 === 0) {
        processLogger.info(`${step.lineRead}th Lines reads`);
      }
    }
    // if have stays data to insert
    if (tab.length !== 0) {
      await insertUPW(tab);
      tab = [];
    }
    processLogger.info('step - end insertion');
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
    processLogger.error(err);
  }

  if (alreadyInstalled) stats = fs.statSync(file);

  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === size) {
    processLogger.info('file already installed');
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
    fail();
    processLogger.error(err);
    return null;
  }

  processLogger.info(typeof compressedFile?.data);

  const downloadFile = async () => new Promise((resolve, reject) => {
    // Get unpaywall file
    if (!(compressedFile?.data instanceof Readable)) {
      return Promise.reject();
    }

    const filePath = path.resolve(downloadDir, filename);

    // download unpaywall file with stream
    const writeStream = compressedFile.data.pipe(fs.createWriteStream(filePath));
    processLogger.info(`Download update snapshot : ${filename}`);
    processLogger.info(`filetype : ${filetype}`);
    processLogger.info(`lines : ${lines}`);
    processLogger.info(`size : ${size}`);
    processLogger.info(`to_date : ${toDate}`);
    // update percent of download
    let timeout;
    (async function percentDownload() {
      let bytes;
      try {
        bytes = await fs.stat(filePath);
      } catch (err) {
        processLogger.error(err);
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
      processLogger.info('step - end download');
      return resolve();
    });

    writeStream.on('error', (err) => {
      processLogger.error(err);
      fail();
      return reject(err);
    });
  });
  await downloadFile();
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
    console.log(err);
    processLogger.error(err);
    fail(start);
    return null;
  }

  if (response?.status !== 200) {
    fail(start);
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

  processLogger.info('step - end fetch unpaywall ');

  return true;
};

module.exports = {
  insertDatasUnpaywall,
  downloadUpdateSnapshot,
  fetchUnpaywall,
};
