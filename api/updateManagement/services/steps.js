const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const axios = require('axios');
const zlib = require('zlib');
const client = require('../../lib/client');
const { processLogger } = require('../../lib/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');

const {
  tasks,
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
    processLogger.error(err);
  }
};

const insertDatasUnpaywall = async (options) => {
  const start = createStepInsert(getMetadatas()[getIteratorFile()]?.filename);

  let loaded = 0;

  const bytes = await fs.stat(
    path.resolve(__dirname, downloadDir, getMetadatas()[getIteratorFile()]?.filename),
  );

  const insertion = async () => {
    let readStream;
    let decompressedStream;
    // read file with stream
    try {
      readStream = fs
        .createReadStream(path.resolve(
          __dirname, downloadDir, getMetadatas()[getIteratorFile()]?.filename,
        ));

      readStream.on('data', (chunk) => {
        loaded += chunk.length;
      });

      decompressedStream = readStream.pipe(zlib.createGunzip());
    } catch (err) {
      fail(start);
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
      tasks.steps[tasks.steps.length - 1].lineRead += 1;
      // limit
      if (tasks.steps[tasks.steps.length - 1].lineRead <= options.limit) {
        break;
      }
      // offset
      if (tasks.steps[tasks.steps.length - 1].lineRead >= options.offset) {
        // fill the table
        const dataupw = JSON.parse(line);
        tab.push(dataupw);
      }
      // bulk insertion
      if (tab.length === 1000) {
        await insertUPW(tab);
        tasks.steps[tasks.steps.length - 1].percent = ((loaded / bytes.size) * 100).toFixed(2);
        tab = [];
      }
      if (tasks.steps[tasks.steps.length - 1]?.lineRead % 100000 === 0) {
        processLogger.info(`${tasks.steps[tasks.steps.length - 1].lineRead}th Lines reads`);
      }
    }
    // if have stays data to insert
    if (tab.length !== 0) {
      await insertUPW(tab);
      tab = [];
    }
    processLogger.info('step - end insertion');
    tasks.steps[tasks.steps.length - 1].status = 'success';
    tasks.steps[tasks.steps.length - 1].took = (new Date() - start) / 1000;
    return true;
  };
  await insertion();
  tasks.steps[tasks.steps.length - 1].percent = 100;
  return true;
};

/**
 * download the snapshot
 */
const downloadUpdateSnapshot = async () => {
  let stats;
  const file = path.resolve(downloadDir, getMetadatas()[getIteratorFile()].filename);
  const alreadyInstalled = await fs.pathExists(file);
  if (alreadyInstalled) stats = fs.statSync(file);
  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === getMetadatas()[getIteratorFile()].size) {
    processLogger.info('file already installed');
    return true;
  }
  // create step download
  const start = createStepDownload(getMetadatas()[getIteratorFile()].filename);
  let compressedFile;
  try {
    compressedFile = await axios({
      method: 'get',
      url: getMetadatas()[getIteratorFile()].url,
      responseType: 'stream',
      headers: { 'Content-Type': 'application/octet-stream' },
    });
  } catch (err) {
    fail();
    processLogger.error(err);
    return null;
  }
  // TODO see for a other syntax
  const downloadFile = () => new Promise((resolve, reject) => {
    // Get unpaywall file
    if (compressedFile && compressedFile.data) {
      // download unpaywall file with stream
      const writeStream = compressedFile.data
        .pipe(fs.createWriteStream(path.resolve(
          __dirname, downloadDir, getMetadatas()[getIteratorFile()].filename,
        )));

      const { size } = getMetadatas()[getIteratorFile()];

      processLogger.info(`Download update snapshot : ${getMetadatas()[getIteratorFile()].filename}`);
      processLogger.info(`filetype : ${getMetadatas()[getIteratorFile()].filetype}`);
      processLogger.info(`lines : ${getMetadatas()[getIteratorFile()].lines}`);
      processLogger.info(`size : ${size}`);
      processLogger.info(`to_date : ${getMetadatas()[getIteratorFile()].to_date}`);

      // update percent of download
      let timeout;
      (async function percentDownload() {
        const bytes = await fs.stat(
          path.resolve(__dirname, downloadDir, getMetadatas()[getIteratorFile()].filename),
        );
        if (bytes.size === size) {
          clearTimeout(timeout);
          return;
        }
        tasks.steps[tasks.steps.length - 1].percent = ((bytes.size / size) * 100).toFixed(2);
        timeout = setTimeout(percentDownload, 3000);
      }());

      writeStream.on('finish', () => {
        tasks.steps[tasks.steps.length - 1].status = 'success';
        tasks.steps[tasks.steps.length - 1].took = (new Date() - start) / 1000;
        tasks.steps[tasks.steps.length - 1].percent = 100;
        processLogger.info('step - end download');
        return resolve();
      });

      writeStream.on('error', (err) => {
        processLogger.error(err);
        fail();
        return reject(err);
      });
    }
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
  const response = await axios({
    method: 'get',
    url,
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response) {
    fail(tasks.createdAt);
    processLogger.error();
    return null;
  }
  if (response.status !== 200) {
    fail(tasks.createdAt);
    processLogger.error();
    return null;
  }
  if (response?.data?.list?.length) {
    tasks.steps[tasks.steps.length - 1].status = 'success';
    tasks.steps[tasks.steps.length - 1].took = (new Date() - tasks.createdAt) / 1000;
    response.data.list.reverse();
    response.data.list.forEach((file) => {
      if (new Date(file.to_date).getTime() >= new Date(startDate).getTime()
        && new Date(file.to_date).getTime() <= new Date(endDate).getTime()
        && file.filetype === 'jsonl') {
        getMetadatas().push(file);
      }
    });
    tasks.steps[tasks.steps.length - 1].status = 'success';
    tasks.steps[tasks.steps.length - 1].took = (new Date() - start) / 1000;
    processLogger.info('step - end fetch unpaywall ');
    return true;
  }
  return true;
};

module.exports = {
  insertDatasUnpaywall,
  downloadUpdateSnapshot,
  fetchUnpaywall,
};
