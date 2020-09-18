const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const { processLogger, apiLogger } = require('../../logger/logger');
const {
  tasks,
  metadatas,
  createStatus,
  getIteratorTask,
  getIteratorFile,
  createStepFetchUnpaywall,
  createStepDownload,
  createStepInsert,
  fail,
} = require('./status');

const {
  insertUPW,
  createReport,
} = require('./unpaywall');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');

/**
 * insert unpaywall datas with a compressed file and stream
 * @param {*} options limit and offset
 */
const insertDatasUnpaywall = () => new Promise((resolve, reject) => {
  console.log('insert');
  const start = createStepInsert();
  (async function insertion() {
    let readStream;
    // read file with stream
    try {
      readStream = fs
        .createReadStream(path.resolve(
          __dirname, downloadDir, metadatas[getIteratorFile()].filename,
        ))
        .pipe(zlib.createGunzip());
    } catch (err) {
      fail(start);
      reject(err);
    }

    let tab = [];

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    processLogger.info('Start insertion');

    // read line by line and sort by pack of 1000
    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      tasks.steps[getIteratorTask()].result.lineRead += 1;
      const dataupw = JSON.parse(line);
      tab.push(dataupw);

      if ((tasks.steps[getIteratorTask()].result.lineRead % 1000) === 0
        && tasks.steps[getIteratorTask()].result.lineRead !== 0) {
        await insertUPW(tab);
        tab = [];
      }
      if (tasks.steps[getIteratorTask()].lineRead % 100000 === 0) {
        processLogger.info(`${tasks.steps[getIteratorTask()].result.lineRead}th Lines reads`);
      }
    }

    // if have stays data to insert
    if (Math.max(tasks.steps[getIteratorTask()].result.lineRead, 1, 1000)) {
      await insertUPW(tab);
      tab = [];
    }
    tasks.endAt = (new Date() - tasks.createdAt) / 1000;
    return resolve();
  }());
});

/**
 * download the snapshot
 */
const downloadUpdateSnapshot = async () => new Promise((resolve, reject) => {
  console.log('download');
  // create step download
  const start = createStepDownload(metadatas[getIteratorFile()].filename);
  let compressedFile;
  // TODO see for a other syntax
  (async function downloadFile() {
    // Get unpaywall file
    try {
      compressedFile = await axios({
        method: 'get',
        url: metadatas[getIteratorFile()].url,
        responseType: 'stream',
        headers: { 'Content-Type': 'application/octet-stream' },
      });
    } catch (err) {
      fail();
      processLogger.error(err);
      createReport('weekly-error');
      reject(err);
    }
    if (compressedFile && compressedFile.data) {
      // download unpaywall file with stream
      const writeStream = compressedFile.data
        .pipe(fs.createWriteStream(path.resolve(
          __dirname, downloadDir, metadatas[getIteratorFile()].filename,
        )));

      processLogger.info(`Download update snapshot : ${metadatas[getIteratorFile()].filename}`);
      processLogger.info(`filetype : ${metadatas[getIteratorFile()].filetype}`);
      processLogger.info(`lines : ${metadatas[getIteratorFile()].lines}`);
      processLogger.info(`size : ${metadatas[getIteratorFile()].size}`);
      processLogger.info(`to_date : ${metadatas[getIteratorFile()].to_date}`);

      writeStream.on('finish', () => {
        tasks.steps[getIteratorTask()].result.status = 'success';
        tasks.steps[getIteratorTask()].result.took = (new Date() - start) / 1000;
        processLogger.info('download finish');
        return resolve();
      });

      // writeStream.on('data', (chunk) => {});

      writeStream.on('error', (err) => {
        fail();
        createReport('weekly-error');
        return reject(err);
      });
    }
  }());
});

/**
 * ask unpaywall to get metadatas on unpaywall snapshot
 */
const fetchUnpaywall = () => new Promise((resolve, reject) => {
  console.log('fetch');
  // create step fetchUnpaywall
  tasks.createdAt = createStepFetchUnpaywall();
  axios({
    method: 'get',
    url: `http://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => {
    if (response?.data?.list?.length) {
      tasks.steps[getIteratorTask()].result.status = 'success';
      tasks.steps[getIteratorTask()].result.took = (new Date() - tasks.createdAt) / 1000;
      // get the first element
      metadatas.push(response.data.list[0]);
      return resolve(metadatas);
    }
    return reject();
  }).catch((err) => {
    fail(tasks.createdAt);
    createReport('weekly-error');
    processLogger.error(err);
    return reject(err);
  });
});

const insertSnapshotBetweenDate = (startDate, endDate) => new Promise((resolve, reject) => {
  axios({
    method: 'get',
    url: `http://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
    headers: { 'Content-Type': 'application/json' },
  }).then(async (response) => {
    response.data.list.reverse();
    response.data.list.forEach((file) => {
      if (new Date(file.to_date).getTime() >= new Date(startDate).getTime()
        && new Date(file.to_date).getTime() <= new Date(endDate).getTime()
        && file.filetype === 'jsonl') {
        metadatas.push(file);
      }
    });
    for (meta of metadatas) {
      // currentStatus = statusByDate;
      // currentStatus.createdAt = new Date();
      // currentStatus.inProcess = true;
      try {
        await downloadUpdateSnapshot(meta);
      } catch (err) {
        apiLogger.error(err);
      }
      try {
        await insertDatasUnpaywall(meta);
      } catch (err) {
        apiLogger.error(err);
      }
    }
    return resolve(true);
  })
    .catch((err) => {
      processLogger.error(err);
      return reject(err);
    });
});

const weeklyUpdate = async () => {
  // initialize informations on task
  tasks.done = false;
  tasks.createdAt = new Date();
  createStatus();
  try {
    await fetchUnpaywall();
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await downloadUpdateSnapshot();
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await insertDatasUnpaywall();
  } catch (err) {
    apiLogger.error(err);
  }
  tasks.done = true;
};

module.exports = {
  /**
   * ask UPW to get the latest update snapshot
   * @returns snapshot metadatas
   */
  fetchUnpaywall,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
