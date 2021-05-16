/* eslint-disable no-await-in-loop */
const fs = require('fs-extra');
const path = require('path');
const chai = require('chai');

const { logger } = require('../../lib/logger');
const client = require('../../lib/client');

const changefiles = require('../../../fakeUnpaywall/snapshots/changefiles.json');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'download');
const snapshotsDir = path.resolve(__dirname, '..', '..', '..', 'fakeUnpaywall', 'snapshots');

const ezunpaywallURL = 'http://localhost:8080';
const fakeUnpaywallURL = 'http://localhost:12000';

const deleteFile = async (name) => {
  const filePath = path.resolve(downloadDir, name);
  const fileExist = await fs.pathExists(filePath);
  if (fileExist) {
    try {
      await fs.unlinkSync(filePath);
    } catch (err) {
      logger.error(`deleteFile: ${err}`);
    }
  }
  logger.info(`file ${filePath} deleted`);
};

const downloadFile = async (name) => new Promise((resolve, reject) => {
  const destination = path.resolve(downloadDir, name);
  const source = path.resolve(snapshotsDir, name);

  const readable = fs.createReadStream(source);
  const writable = fs.createWriteStream(destination);

  // download unpaywall file with stream
  const writeStream = readable.pipe(writable);

  writeStream.on('finish', () => {
    logger.info(`file ${name} is installed`);
    return resolve();
  });

  writeStream.on('error', (err) => {
    logger.error(`downloadFile: ${err}`);
    return reject(err);
  });
});

const initializeDate = async () => {
  const changefilesPath = path.resolve(__dirname, '..', '..', '..', 'fakeUnpaywall', 'snapshots', 'changefiles.json');
  const now = Date.now();
  const oneDay = (1 * 24 * 60 * 60 * 1000);

  changefiles.list[0].to_date = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[0].last_modified = new Date(now - (1 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[0].from_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);

  changefiles.list[1].to_date = new Date(now - (8 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[1].last_modified = new Date(now - (8 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[1].from_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);

  changefiles.list[2].to_date = new Date(now - (15 * oneDay)).toISOString().slice(0, 10);
  changefiles.list[2].last_modified = new Date(now - (15 * oneDay)).toISOString().slice(0, 19);
  changefiles.list[2].from_date = new Date(now - (22 * oneDay)).toISOString().slice(0, 10);
  try {
    await fs.writeFile(changefilesPath, JSON.stringify(changefiles, null, 2), 'utf8');
  } catch (err) {
    logger.error(`fs.writeFile in initializeDate: ${err}`);
  }
};

const binaryParser = (res, cb) => {
  res.setEncoding('binary');
  res.data = '';
  res.on('data', (chunk) => {
    res.data += chunk;
  });
  res.on('end', () => {
    cb(null, Buffer.from(res.data, 'binary'));
  });
};

const compareFile = async (path1, path2) => {
  const file1 = await fs.readFile(path1, 'utf-8');
  const file2 = await fs.readFile(path2, 'utf-8');
  return file1.trim().replace(/\r\n/g, '\n') === file2.trim().replace(/\r\n/g, '\n');
};

const ping = async () => {
  let res1;
  while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
    try {
      res1 = await chai.request(ezunpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`ezunpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait fakeUnpaywall
  let res2;
  while (res2?.body?.data !== 'pong') {
    try {
      res2 = await chai.request(fakeUnpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`fakeUnpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait elastic started
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      logger.error(`elastic ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

module.exports = {
  initializeDate,
  deleteFile,
  downloadFile,
  binaryParser,
  compareFile,
  ping,
};