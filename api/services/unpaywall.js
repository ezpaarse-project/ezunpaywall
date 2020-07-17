const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const prettyBytes = require('pretty-bytes');
const UnPayWallModel = require('../graphql/unpaywall/model');
const { processLogger } = require('./logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'download');
const reportDir = path.resolve(__dirname, '..', '..', 'reports');

// UnPayWall attributes
const raw = [
  'best_oa_location',
  'data_standard',
  'doi_url',
  'genre',
  'is_paratext',
  'is_oa',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issns',
  'journal_issn_l',
  'journal_name',
  'oa_locations',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
  'z_authors',
  'createdAt',
];

let metadata = {};
let lineRead = 0;

// this object is visible at /process/status
const status = {
  inProcess: false,
  route: '',
  currentStatus: '',
  currentFile: '',
  askAPI: {
    success: '',
    took: '',
  },
  download: {
    size: '',
    percent: '',
    took: '',
  },
  upsert: {
    read: 0,
    total: 0,
    percent: 0,
    lineProcessed: 0,
    took: '',
  },
  createdAt: '',
  endAt: '',
  took: '',
};

let currentStatus = {};
const resetStatus = () => {
  currentStatus = Object.assign(status, {});
};

const createReport = () => {
  try {
    fs.writeFileSync(`${reportDir}/${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(currentStatus, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

const upsertUPW = (data) => {
  UnPayWallModel.bulkCreate(data, { updateOnDuplicate: raw })
    .catch((error) => {
      processLogger.error(`ERROR IN UPSERT : ${error}`);
    });
};

const getTotalLine = async () => UnPayWallModel.count({});

/**
 * stream compressed snapshot file and do insert
 */
const saveDataOrUpdate = async (options) => {
  let opts = options || { offset: 0, limit: -1 };
  if (currentStatus.createdAt === '') {
    currentStatus.inProcess = true;
    currentStatus.createdAt = new Date();
    currentStatus.currentFile = 'unpaywall_snapshot.jsonl.gz';
    currentStatus.route = `init?offset=${opts.offset}&limit=${opts.limit}`;
  } else {
    currentStatus.upsert.total = metadata.lines - opts.offset;
  }
  const lineInitial = await getTotalLine();
  // stream initialization
  currentStatus.currentStatus = 'upsert';
  const readStream = fs.createReadStream(path.resolve(__dirname, downloadDir, currentStatus.currentFile))
    .pipe(zlib.createGunzip());
  const start = new Date();
  let tab = [];
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    // test limit
    if (lineRead === opts.limit) {
      break;
    }
    // test offset
    if (lineRead >= opts.offset) {
      currentStatus.upsert.lineProcessed += 1;
      const data = JSON.parse(line);
      tab.push(data);
    }
    lineRead += 1;
    if (currentStatus.route === 'update') {
      const percent = (lineRead / metadata.lines) * 100;
      currentStatus.upsert.percent = Math.ceil(percent, 2);
    }
    currentStatus.upsert.read = lineRead;
    if ((currentStatus.upsert.lineProcessed % 1000) === 0 && currentStatus.upsert.lineProcessed !== 0) {
      await upsertUPW(tab);
      tab = [];
    }
    if (lineRead % 100000 === 0) {
      processLogger.info(`${lineRead}th Lines processed`);
    }
  }
  // if have stays data to insert
  if (Math.max(currentStatus.lineProcessed, 1, 1000)) {
    await upsertUPW(tab);
  }
  const lineFinal = await getTotalLine();
  const total = (new Date() - start) / 1000;
  processLogger.info('============= FINISH =============');
  processLogger.info(`${total} seconds`);
  processLogger.info(`Number of lines read : ${lineRead}`);
  if (currentStatus.route === 'update') {
    processLogger.info(`Number of lines announced : ${metadata.lines}`);
  }
  processLogger.info(`Number of treated lines : ${currentStatus.upsert.lineProcessed}`);
  processLogger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  processLogger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial + opts.offset)}`);
  processLogger.info(`Number of errors : ${lineRead - opts.offset - currentStatus.upsert.lineProcessed}`);
  currentStatus.endAt = new Date();
  currentStatus.currentStatus = 'done';
  currentStatus.took = (currentStatus.endAt - currentStatus.createdAt) / 1000;
  currentStatus.inProcess = false;
  createReport();
};

/**
 * ask UPW to get compressed update snaphot
 */
const downloadUpdateSnapshot = async () => {
  try {
    const start = new Date();
    currentStatus.currentFile = metadata.filename;
    currentStatus.currentStatus = 'download snapshot';
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
        saveDataOrUpdate();
      });

      (function stat() {
        let percent = 0;
        fs.stat(path.resolve(downloadDir, metadata.filename), (err, stats) => {
          if (err) throw err;
          percent = (stats.size / metadata.size) * 100;
          currentStatus.download.size = `${prettyBytes(stats.size)} / ${prettyBytes(metadata.size)}`;
          currentStatus.download.percent = Math.ceil(percent, 2);
        });
        if (Number.parseInt(percent, 10) < 100) {
          setTimeout(stat, 1000);
        }
      }());
      writeStream.on('error', () => {
        currentStatus.currentStatus = 'error';
        currentStatus.inProcess = false;
        createReport();
      });
    }
  } catch (error) {
    currentStatus.currentStatus = 'error';
    currentStatus.inProcess = false;
    createReport();
  }
};

module.exports = {
  getStatus: () => status,
  getTotalLine,
  saveDataOrUpdate,
  resetStatus,
  /**
   * ask UPW to get the latest update snapshot
   * @returns snapshot metadatas
   */
  getUpdateSnapshotMetadatas: async () => {
    let response;
    try {
      const start = new Date();
      currentStatus.createdAt = new Date();
      currentStatus.route = 'update';
      currentStatus.inProcess = true;
      currentStatus.currentStatus = 'ask UPW to get metadatas';
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
      currentStatus.currentStatus = 'error';
      currentStatus.inProcess = false;
      createReport();
    }
  },
};
