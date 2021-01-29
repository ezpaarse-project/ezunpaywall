const fs = require('fs-extra');
const path = require('path');
const chai = require('chai');

const client = require('../lib/client');
const { logger } = require('../lib/logger');

const changefiles = require('../../fakeUnpaywall/snapshots/changefiles.json');

const ezunpaywallURL = 'http://localhost:8080';
const fakeUnpaywallURL = 'http://localhost:12000';

const isIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`Error in indices.exists in isIndexExist: ${err}`);
  }
  return res.body;
};

const deleteIndex = async (name) => {
  const exist = await isIndexExist(name);
  if (exist) {
    try {
      await client.indices.delete({
        index: name,
      });
    } catch (err) {
      logger.error(`Error in deleteIndex: ${err}`);
    }
  }
};

const createIndex = async (name, index) => {
  await deleteIndex(name);
  try {
    await client.indices.create({
      index: name,
      body: index,
    });
  } catch (err) {
    logger.error(`Error in indices.delete increateIndex: ${err}`);
  }
};

const countDocuments = async () => {
  const exist = await isIndexExist('unpaywall');
  let data;
  if (exist) {
    try {
      data = await client.count({
        index: 'unpaywall',
      });
    } catch (err) {
      logger.error(`Error in countDocuments: ${err}`);
    }
  }
  return data.body.count ? data.body.count : null;
};

const isTaskEnd = async () => {
  const exist = await isIndexExist('task');
  let task;
  if (exist) {
    try {
      task = await client.search({
        index: 'task',
      });
    } catch (err) {
      logger.error(`Error in isTaskEnd: ${err}`);
    }
  }
  return task?.body?.hits?.hits[0]?._source?.done;
};

const getTask = async () => {
  const exist = await isIndexExist('task');
  let task;
  if (exist) {
    try {
      task = await client.search({
        index: 'task',
      });
    } catch (err) {
      logger.error(`Error in getTask: ${err}`);
    }
  }
  return task?.body?.hits?.hits[0]?._source;
};

const deleteFile = async (name) => {
  const filePath = path.resolve(__dirname, '..', 'out', 'download', name);
  const fileExist = await fs.pathExists(filePath);
  if (fileExist) {
    try {
      await fs.unlinkSync(filePath);
    } catch (err) {
      logger.error(`Error in deleteFile: ${err}`);
    }
  }
};

const downloadFile = (name) => new Promise((resolve, reject) => {
  const destination = path.resolve(__dirname, '..', 'out', 'download', name);
  const source = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots', name);

  const readable = fs.createReadStream(source);
  const writable = fs.createWriteStream(destination);

  // download unpaywall file with stream
  const writeStream = readable.pipe(writable);

  writeStream.on('finish', () => {
    logger.info(`File ${name} is installed`);
    return resolve();
  });

  writeStream.on('error', (err) => {
    logger.error(`Error in downloadFile: ${err}`);
    return reject(err);
  });
});

const initializeDate = async () => {
  const changefilesPath = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots', 'changefiles.json');
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
    logger.error(`Error in fs.writeFile in initializeDate: ${err}`);
  }
};

const getLatestReport = async () => {
  let report;
  try {
    const response = await chai.request(ezunpaywallURL).get('/reports?latest=true');
    report = response?.body;
  } catch (err) {
    logger.error(`Error in ezunpaywall ping : ${err}`);
  }
  return report;
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  isTaskEnd,
  getTask,
  deleteFile,
  downloadFile,
  initializeDate,
  getLatestReport,
};
