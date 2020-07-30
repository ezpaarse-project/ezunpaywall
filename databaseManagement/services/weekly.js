const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const prettyBytes = require('pretty-bytes');
const { processLogger, apiLogger } = require('../../logger/logger');
const {
  upsertUPW,
  getTotalLine,
  createReport,
  createStatus,
  resetStatus,
  statusWeekly,
  statusByDate,
} = require('./unpaywall');

let currentStatus;

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');

let metadata = [];
let lineRead = 0;
let error = 0;

const endLogWeekly = async (took, lineInitial, data) => {
  currentStatus.download.took = took;
  currentStatus.status = 'Count lines for logs';
  const lineFinal = await getTotalLine();
  processLogger.info(`took ${took} seconds`);
  processLogger.info(`Number of lines read : ${lineRead}`);
  processLogger.info(`Number of lines announced : ${data.lines}`);
  processLogger.info(`Number of treated lines : ${currentStatus.upsert.lineProcessed}`);
  processLogger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  processLogger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial)}`);
  processLogger.info(`Number of errors : ${error}`);
  currentStatus.endAt = new Date();
  currentStatus.status = 'done';
  currentStatus.took = (currentStatus.endAt - currentStatus.createdAt) / 1000;
  await createReport(currentStatus, 'weekly');
  await createStatus();
  await resetStatus();
  metadata = {};
  lineRead = 0;
  error = 0;
};

const startLogWeekly = async (data) => {
  currentStatus.inProcess = true;
  currentStatus.createdAt = new Date();
  currentStatus.upsert.total = data.lines;
  currentStatus.status = 'Count lines for log';
  processLogger.info('Count for logs');
  const total = await getTotalLine();
  return total;
};

/**
 * stream compressed snapshot file and do upsert weekly
 * @param {*} options limit and offset
 */
const readSnapshotFileWeekly = (data) => new Promise((resolve, reject) => {
  (async function insertion() {
    const lineInitial = await startLogWeekly(data);
    currentStatus.status = 'upsert';
    let readStream;
    // stream initialization
    try {
      readStream = fs
        .createReadStream(path.resolve(__dirname, downloadDir, currentStatus.currentFile))
        .pipe(zlib.createGunzip());
    } catch (err) {
      reject(err);
    }

    const start = new Date();
    let tab = [];

    const rl = readline.createInterface({
      input: readStream,
      crlfDelay: Infinity,
    });

    processLogger.info('Start insertion');

    // eslint-disable-next-line no-restricted-syntax
    for await (const line of rl) {
      // if (lineRead === 3000) {
      //   const took = (new Date() - start) / 1000;
      //   await endLogWeekly(took, lineInitial, data);
      //   currentStatus.inProcess = false;
      //   return resolve();
      // }
      currentStatus.upsert.lineProcessed += 1;
      const dataupw = JSON.parse(line);
      tab.push(dataupw);
      lineRead += 1;
      const percent = (lineRead / data.lines) * 100;
      currentStatus.upsert.percent = Math.ceil(percent, 2);
      currentStatus.upsert.read = lineRead;

      if ((currentStatus.upsert.lineProcessed % 1000) === 0
        && currentStatus.upsert.lineProcessed !== 0) {
        await upsertUPW(tab);
        tab = [];
      }
      if (lineRead % 100000 === 0) {
        processLogger.info(`${lineRead}th Lines reads`);
      }
    }

    // if have stays data to insert
    if (Math.max(currentStatus.lineProcessed, 1, 1000)) {
      const res = await upsertUPW(tab);
      if (!res) {
        error += 1;
      }
    }

    const took = (new Date() - start) / 1000;
    await endLogWeekly(took, lineInitial, data);
    currentStatus.inProcess = false;
    return resolve();
  }());
});

/**
 * ask UPW to get compressed update snaphot
 */
const downloadUpdateSnapshot = (data) => new Promise((resolve, reject) => {
  const start = new Date();
  currentStatus.currentFile = data.filename;
  currentStatus.status = 'download snapshot';
  let compressedFile;

  (async function downloadFile() {
    try {
      compressedFile = await axios({
        method: 'get',
        url: data.url,
        responseType: 'stream',
        headers: { 'Content-Type': 'application/octet-stream' },
      });
    } catch (err) {
      currentStatus.status = 'error';
      currentStatus.inProcess = false;
      processLogger.error(err);
      createReport('weekly-error');
      reject(err);
    }
    if (compressedFile && compressedFile.data) {
      const writeStream = compressedFile.data
        .pipe(fs.createWriteStream(path.resolve(__dirname, downloadDir, data.filename)));

      processLogger.info(`Download update snapshot : ${data.filename}`);
      processLogger.info(`filetype : ${data.filetype}`);
      processLogger.info(`lines : ${data.lines}`);
      processLogger.info(`size : ${data.size}`);
      processLogger.info(`to_date : ${data.to_date}`);

      writeStream.on('finish', () => {
        processLogger.info('download finish');
        currentStatus.download.took = (new Date() - start) / 1000;
        return resolve();
      });

      writeStream.on('error', (err) => {
        currentStatus.status = 'error';
        currentStatus.inProcess = false;
        createReport('weekly-error');
        return reject(err);
      });

      let timeout;
      (function reloadStatus() {
        let percent = 0;
        const stats = fs.statSync(path.resolve(downloadDir, data.filename));
        if (stats) {
          percent = (stats.size / data.size) * 100;
          currentStatus.download.size = `${prettyBytes(stats.size)} / ${prettyBytes(data.size)}`;
          currentStatus.download.percent = Math.ceil(percent, 2);
          if (Number.parseInt(percent, 10) < 100) {
            timeout = setTimeout(reloadStatus, 1000);
          } else {
            clearTimeout(timeout);
          }
        }
      }());
    }
  }());
});

const getUpdateSnapshotMetadatas = () => new Promise((resolve, reject) => {
  currentStatus = statusWeekly;
  const start = new Date();
  currentStatus.createdAt = new Date();
  currentStatus.route = '/updates/weekly';
  currentStatus.inProcess = true;
  currentStatus.status = 'ask UPW to get metadatas';

  axios({
    method: 'get',
    url: `http://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
    headers: { 'Content-Type': 'application/json' },
  }).then((response) => {
    if (response?.data?.list?.length) {
      [metadata] = response.data.list;
      currentStatus.askAPI.success = true;
      currentStatus.askAPI.took = (new Date() - start) / 1000;
      return resolve(metadata);
    }
    return reject();
  }).catch((err) => {
    currentStatus.status = 'error';
    currentStatus.inProcess = false;
    processLogger.error(err);
    createReport('weekly-error');
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
        metadata.push(file);
      }
    });
    for (meta of metadata) {
      currentStatus = statusByDate;
      currentStatus.createdAt = new Date();
      currentStatus.inProcess = true;
      try {
        await downloadUpdateSnapshot(meta);
      } catch (err) {
        apiLogger.error(err);
      }
      try {
        await readSnapshotFileWeekly(meta);
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
  try {
    await getUpdateSnapshotMetadatas();
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await downloadUpdateSnapshot(metadata);
  } catch (err) {
    apiLogger.error(err);
  }
  try {
    await readSnapshotFileWeekly(metadata);
  } catch (err) {
    apiLogger.error(err);
  }
};

module.exports = {
  /**
   * ask UPW to get the latest update snapshot
   * @returns snapshot metadatas
   */
  getUpdateSnapshotMetadatas,
  weeklyUpdate,
  insertSnapshotBetweenDate,
};
