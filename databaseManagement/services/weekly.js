const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const prettyBytes = require('pretty-bytes');
const UnPayWallModel = require('../../apiGraphql/unpaywall/model');
const { processLogger } = require('../../logger/logger');
const { upsertUPW, getTotalLine, statusWeekly } = require('./unpaywall');

const currentStatus = statusWeekly;

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');
const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');
const statusDir = path.resolve(__dirname, '..', '..', 'out', 'status');

let metadata = {};
let lineRead = 0;

const createReport = (route) => {
  try {
    fs.writeFileSync(`${reportDir}/${route}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(currentStatus, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

const databaseStatus = async () => {
  const statusDB = {};
  statusDB.doi = await UnPayWallModel.count({});
  statusDB.is_oa = await UnPayWallModel.count({
    where: {
      is_oa: 'true',
    },
  });
  statusDB.journal_issn_l = await UnPayWallModel.count({
    col: 'journal_issn_l',
    distinct: true,
  });
  statusDB.publisher = await UnPayWallModel.count({
    col: 'publisher',
    distinct: true,
  });
  statusDB.gold = await UnPayWallModel.count({
    where: {
      oa_status: 'gold',
    },
  });
  statusDB.hybrid = await UnPayWallModel.count({
    where: {
      oa_status: 'hybrid',
    },
  });
  statusDB.bronze = await UnPayWallModel.count({
    where: {
      oa_status: 'bronze',
    },
  });
  statusDB.green = await UnPayWallModel.count({
    where: {
      oa_status: 'green',
    },
  });
  statusDB.closed = await UnPayWallModel.count({
    where: {
      oa_status: 'closed',
    },
  });
  return statusDB;
};

const createStatus = async () => {
  const dbStatus = await databaseStatus();
  fs.writeFileSync(`${statusDir}/status-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(dbStatus, null, 2));
};

const endLogWeekly = async (took, lineInitial) => {
  currentStatus.status = 'Count lines for logs';
  const lineFinal = await getTotalLine();
  processLogger.info(`took ${took} seconds`);
  processLogger.info(`Number of lines read : ${lineRead}`);
  processLogger.info(`Number of lines announced : ${metadata.lines}`);
  processLogger.info(`Number of treated lines : ${currentStatus.upsert.lineProcessed}`);
  processLogger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  processLogger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial)}`);
  processLogger.info(`Number of errors : ${lineRead - currentStatus.upsert.lineProcessed}`);
  currentStatus.endAt = new Date();
  currentStatus.status = 'done';
  currentStatus.took = (currentStatus.endAt - currentStatus.createdAt) / 1000;
  currentStatus.inProcess = false;
  currentStatus.status = 'done';
  await createReport('weekly');
  await createStatus();
};

const startLogWeekly = () => {
  currentStatus.inProcess = true;
  currentStatus.createdAt = new Date();
  currentStatus.upsert.total = metadata.lines;
  currentStatus.status = 'upsert';
};

/**
 * stream compressed snapshot file and do upsert weekly
 * @param {*} options limit and offset
 */
const readSnapshotFileWeekly = async () => {
  startLogWeekly();
  const lineInitial = await getTotalLine();
  // stream initialization
  const readStream = fs
    .createReadStream(path.resolve(__dirname, downloadDir, currentStatus.currentFile))
    .pipe(zlib.createGunzip());
  const start = new Date();
  let tab = [];
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    currentStatus.upsert.lineProcessed += 1;
    const data = JSON.parse(line);
    tab.push(data);
    lineRead += 1;
    const percent = (lineRead / metadata.lines) * 100;
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
    await upsertUPW(tab);
  }
  const took = (new Date() - start) / 1000;
  endLogWeekly(took, lineInitial);
};

/**
 * ask UPW to get compressed update snaphot
 */
const downloadUpdateSnapshot = async () => {
  try {
    const start = new Date();
    currentStatus.currentFile = metadata.filename;
    currentStatus.status = 'download snapshot';
    const compressedFile = await axios({
      method: 'get',
      url: metadata.url,
      responseType: 'stream',
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (compressedFile && compressedFile.data) {
      const writeStream = compressedFile.data
        .pipe(fs.createWriteStream(path.resolve(__dirname, downloadDir, metadata.filename)));
      processLogger.info(`Download update snapshot : ${metadata.filename}`);
      processLogger.info(`filetype : ${metadata.filetype}`);
      processLogger.info(`lines : ${metadata.lines}`);
      processLogger.info(`size : ${metadata.size}`);
      processLogger.info(`to_date : ${metadata.to_date}`);
      writeStream.on('finish', () => {
        processLogger.info('download finish, start insert');
        currentStatus.download.took = (new Date() - start) / 1000;
        readSnapshotFileWeekly();
      });

      (function reloadStatus() {
        let percent = 0;
        fs.stat(path.resolve(downloadDir, metadata.filename), (err, stats) => {
          if (err) throw err;
          percent = (stats.size / metadata.size) * 100;
          currentStatus.download.size = `${prettyBytes(stats.size)} / ${prettyBytes(metadata.size)}`;
          currentStatus.download.percent = Math.ceil(percent, 2);
        });
        if (Number.parseInt(percent, 10) < 100) {
          setTimeout(reloadStatus, 1000);
        }
      }());
      writeStream.on('error', () => {
        currentStatus.status = 'error';
        currentStatus.inProcess = false;
        createReport();
      });
    }
  } catch (error) {
    currentStatus.status = 'error';
    currentStatus.inProcess = false;
    createReport();
  }
};

module.exports = {
  /**
   * ask UPW to get the latest update snapshot
   * @returns snapshot metadatas
   */
  getUpdateSnapshotMetadatas: async () => {
    let response;
    try {
      const start = new Date();
      currentStatus.createdAt = new Date();
      currentStatus.route = 'weeklyUpdate';
      currentStatus.inProcess = true;
      currentStatus.status = 'ask UPW to get metadatas';
      response = await axios({
        method: 'get',
        url: `http://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
        headers: { 'Content-Type': 'application/json' },
      });
      if (response?.data?.list?.length) {
        [metadata] = response.data.list;
        currentStatus.askAPI.success = true;
        currentStatus.askAPI.took = (new Date() - start) / 1000;
        downloadUpdateSnapshot();
      }
    } catch (error) {
      currentStatus.status = 'error';
      currentStatus.inProcess = false;
      createReport();
    }
  },
};
