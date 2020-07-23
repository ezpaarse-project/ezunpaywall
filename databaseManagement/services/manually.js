const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');

const { processLogger } = require('../../logger/logger');
const {
  upsertUPW,
  getTotalLine,
  createReport,
  createStatus,
  statusManually,
} = require('./unpaywall');

const currentStatus = statusManually;

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'download');

let lineRead = 0;
let error = 0;

const startLogManually = (opts, name) => {
  currentStatus.inProcess = true;
  currentStatus.createdAt = new Date();
  currentStatus.currentFile = name;
  currentStatus.route = `/action/${name}?offset=${opts.offset}&limit=${opts.limit}`;
};

const endLogManually = async (took, lineInitial, opts) => {
  currentStatus.status = 'Count lines for logs';
  const lineFinal = await getTotalLine();
  processLogger.info(`took ${took} seconds`);
  processLogger.info(`Number of lines read : ${lineRead}`);
  processLogger.info(`Number of treated lines : ${currentStatus.upsert.lineProcessed}`);
  processLogger.info(`Number of insert lines : ${lineFinal - lineInitial}`);
  processLogger.info(`Number of update lines : ${lineRead - (lineFinal - lineInitial + opts.offset)}`);
  processLogger.info(`Number of errors : ${lineRead - opts.offset - currentStatus.upsert.lineProcessed}`);
  currentStatus.endAt = new Date();
  currentStatus.took = (currentStatus.endAt - currentStatus.createdAt) / 1000;
  currentStatus.inProcess = false;
  currentStatus.status = 'done';
  await createReport('manually');
  await createStatus();
};

const readSnapshotFileManually = async (name, options) => {
  const opts = options || { offset: 0, limit: -1 };
  await startLogManually(opts, name);
  currentStatus.status = 'Count lines for logs';
  const lineInitial = await getTotalLine();
  currentStatus.status = 'Upsert';
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
    // test limit
    if (lineRead === opts.limit) {
      break;
    }
    // test offset
    if (lineRead >= opts.offset) {
      lineRead += 1;
      currentStatus.upsert.lineProcessed += 1;
      const data = JSON.parse(line);
      tab.push(data);
    }
    currentStatus.upsert.read = lineRead;
    if ((currentStatus.upsert.lineProcessed % 1000) === 0
      && currentStatus.upsert.lineProcessed !== 0) {
      const res = await upsertUPW(tab);
      if (!res) {
        error += 1;
      }
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
  await endLogManually(took, lineInitial, opts);
};

module.exports = {
  readSnapshotFileManually,
};
