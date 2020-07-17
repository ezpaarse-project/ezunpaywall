const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const prettyBytes = require('pretty-bytes');
const UnPayWallModel = require('../graphql/unpaywall/model');
const logger = require('./logger');

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
let status = {
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
    lineRead: '',
    percent: '',
    lineProcessed: 0,
    took: '',
  },
  createdAt: '',
  endAt: '',
  took: '',
};

const resetStatus = () => {
  status = {
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
      lineRead: '',
      percent: '',
      lineProcessed: 0,
      took: '',
    },
    createdAt: '',
    endAt: '',
    took: '',
  };
};

const createReport = () => {
  try {
    fs.writeFileSync(`${reportDir}/${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(status, null, 2));
  } catch (error) {
    console.log(error);
  }
};

const upsertUPW = (data) => {
  UnPayWallModel.bulkCreate(data, { updateOnDuplicate: raw })
    .catch((error) => {
      logger.error(`ERROR IN UPSERT : ${error}`);
    });
};

const getTotalLine = async () => UnPayWallModel.count({});

/**
 * stream compressed snapshot file and do insert
 */
const saveDataOrUpdate = async (options) => {
  let opts = options || { offset: 0, limit: -1 };
  if (status.createdAt === '') {
    status.inProcess = true;
    status.createdAt = new Date();
    status.currentFile = 'unpaywall_snapshot.jsonl.gz';
    status.route = `init?offset=${opts.offset}&limit=${opts.limit}`;
  }
  const lineInitial = await getTotalLine();
  // stream initialization
  status.currentStatus = 'upsert';
  const readStream = fs.createReadStream(path.resolve(__dirname, downloadDir, status.currentFile))
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
      status.upsert.lineProcessed += 1;
      const data = JSON.parse(line);
      tab.push(data);
    }
    lineRead += 1;
    if (status.route === 'update') {
      const percent = (lineRead / metadata.lines) * 100;
      status.upsert.lineRead = `${lineRead} lines / ${metadata.lines - opts.offset} lines`;
      status.upsert.percent = percent.toFixed(2);
    } else {
      status.upsert.lineRead = `${lineRead}`;
    }
    if ((status.upsert.lineProcessed % 1000) === 0 && status.upsert.lineProcessed !== 0) {
      await upsertUPW(tab);
      tab = [];
    }
    if (lineRead % 100000 === 0) {
      logger.info(`${lineRead}th Lines processed`);
    }
  }
  // if have stays data to insert
  if (Math.max(status.lineProcessed, 1, 1000)) {
    await upsertUPW(tab);
  }
  opts = { offset: 0, limit: -1 };
  const lineFinal = await getTotalLine();
  const total = (new Date() - start) / 1000;
  logger.info('============= FINISH =============');
  logger.info(`${total} seconds`);
  logger.info(`Number of lines read : ${lineRead}`);
  if (status.route === 'update') {
    logger.info(`Number of lines announced : ${metadata.lines}`);
  }
  logger.info(`Number of treated lines : ${status.lineProcessed}`);
  logger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  logger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial + opts.offset)}`);
  logger.info(`Number of errors : ${lineRead - (status.lineProcessed + opts.offset)}`);
  status.endAt = new Date();
  status.currentStatus = 'done';
  status.took = (status.endAt - status.createdAt) / 1000;
  status.inProcess = false;
  createReport();
};

/**
 * ask UPW to get compressed update snaphot
 */
const downloadUpdateSnapshot = async () => {
  try {
    const start = new Date();
    status.currentFile = metadata.filename;
    status.currentStatus = 'download snapshot';
    const compressedFile = await axios({
      method: 'get',
      url: metadata.url,
      responseType: 'stream',
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    if (compressedFile && compressedFile.data) {
      const writeStream = compressedFile.data
        .pipe(fs.createWriteStream(path.resolve(__dirname, downloadDir, metadata.filename)));
      logger.info(`Download update snapshot : ${metadata.filename}`);
      logger.info(`filetype : ${metadata.filetype}`);
      logger.info(`lines : ${metadata.lines}`);
      logger.info(`size : ${metadata.size}`);
      logger.info(`to_date : ${metadata.to_date}`);
      writeStream.on('finish', () => {
        logger.info('download finish, start insert');
        status.download.took = (new Date() - start) / 1000;
        saveDataOrUpdate();
      });

      (function stat() {
        let percent = 0;
        fs.stat(path.resolve(downloadDir, metadata.filename), (err, stats) => {
          if (err) throw err;
          percent = (stats.size / metadata.size) * 100;
          status.download.size = `${prettyBytes(stats.size)} / ${prettyBytes(metadata.size)}`;
          status.download.percent = percent.toFixed(2);
        });
        if (Number.parseInt(percent, 10) < 100) {
          setTimeout(stat, 1000);
        }
      }());
      writeStream.on('error', () => {
        status.currentStatus = 'error';
        status.inProcess = false;
        createReport();
      });
    }
  } catch (error) {
    status.currentStatus = 'error';
    status.inProcess = false;
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
      status.createdAt = new Date();
      status.route = 'update';
      status.inProcess = true;
      status.currentStatus = 'ask UPW to get metadatas';
      response = await axios({
        method: 'get',
        url: `http://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
        headers: { 'Content-Type': 'application/json' },
      });
      if (response?.data?.list?.length) {
        [metadata] = response.data.list;
        status.askAPI.success = true;
        status.askAPI.took = (new Date() - start) / 1000;
        downloadUpdateSnapshot();
      }
    } catch (error) {
      status.currentStatus = 'error';
      status.inProcess = false;
      createReport();
    }
  },
};
