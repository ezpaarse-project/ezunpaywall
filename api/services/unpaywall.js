const path = require('path');
const fs = require('fs');
const readline = require('readline');
const zlib = require('zlib');
const axios = require('axios');
const config = require('config');
const prettyBytes = require('pretty-bytes');
const UnPayWallModel = require('../graphql/unpaywall/model');
const logger = require('../../logs/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'download');
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

const status = {
  inProcess: false,
  status: '',
  currentFile: 'unpaywall_snapshot.jsonl.gz',
  download: '',
  percentDownload: '',
  lineRead: '',
  pourcentRead: '',
  lineProcessed: 0,
  createdAt: '',
  endAt: '',
};

const upsertUPW = (data) => {
  logger.info(`${lineRead}th Lines processed`);
  UnPayWallModel.bulkCreate(data, { updateOnDuplicate: raw })
    .catch((error) => {
      logger.error(`ERROR IN UPSERT : ${error}`);
    });
};

const setStatus = (key, value) => { status[key] = value; };
const getTotalLine = async () => UnPayWallModel.count({});

/**
 * stream compressed snapshot file and do insert
 */
const saveDataOrUpdate = async (options) => {
  const lineInitial = await getTotalLine();
  let opts = options || { offset: 0, limit: -1 };
  // stream initialization
  setStatus('status', 'upsert');
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
      status.lineProcessed += 1;
      const data = JSON.parse(line);
      tab.push(data);
    }
    lineRead += 1;
    const percent = (lineRead / metadata.lines) * 100;
    status.lineRead = `${lineRead} lines / ${metadata.lines - opts.offset} lines`;
    status.percentRead = percent.toFixed(2);
    if ((status.lineProcessed % 1000) === 0 && status.lineProcessed !== 0) {
      await upsertUPW(tab);
      tab = [];
    }
  }
  // if have stays data to insert
  if (Math.max(status.lineProcessed, 1, 1000)) {
    await upsertUPW(tab);
  }
  const lineFinal = await getTotalLine();
  const total = (new Date() - start) / 1000;
  logger.info('============= FINISH =============');
  logger.info(`${total} seconds`);
  logger.info(`Number of lines read : ${lineRead} / ${metadata.lines} (from UPW)`);
  logger.info(`Number of treated lines : ${status.lineProcessed}`);
  logger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  logger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial + opts.offset)}`);
  logger.info(`Number of errors : ${lineRead - (status.lineProcessed + opts.offset)}`);
  setStatus('endAt', new Date());
  setStatus('inProcess', false);
  opts = { offset: 0, limit: -1 };
};

/**
 * ask UPW to get compressed update snaphot
 */
const downloadUpdateSnapshot = async () => {
  try {
    setStatus('currentFile', metadata.filename);
    setStatus('status', 'download snapshot');
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
        saveDataOrUpdate();
      });

      (function stat() {
        let percent = 0;
        fs.stat(`./download/${metadata.filename}`, (err, stats) => {
          if (err) throw err;
          percent = (stats.size / metadata.size) * 100;
          status.download = `${prettyBytes(stats.size)} / ${prettyBytes(metadata.size)}`;
          status.percentDownload = percent.toFixed(2);
        });
        if (Number.parseInt(percent, 10) < 100) {
          setTimeout(stat, 1000);
        }
      }());
      writeStream.on('error', () => {
        setStatus('inProcess', false);
      });
    }
  } catch (error) {
    setStatus('inProcess', false);
  }
};

module.exports = {
  getStatus: () => status,
  getTotalLine,
  saveDataOrUpdate,

  /**
   * ask UPW to get the latest update snapshot
   * @returns snapshot metadatas
   */
  getUpdateSnapshotMetadatas: async () => {
    let response;
    try {
      setStatus('createdAt', new Date());
      setStatus('inProcess', true);
      setStatus('status', 'ask UPW to get metadatas');
      response = await axios({
        method: 'get',
        url: `https://api.unpaywall.org/feed/changefiles?api_key=${config.get('API_KEY_UPW')}`,
        headers: { 'Content-Type': 'application/json' },
      });
      // TODO refaire à la yannick
      if (response.data.list.length) {
        metadata = response.data.list[4];
        downloadUpdateSnapshot();
      }
    } catch (error) {
      setStatus('inProcess', false);
    }
  },


};
