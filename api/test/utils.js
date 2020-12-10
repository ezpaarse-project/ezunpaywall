const fs = require('fs-extra')
const path = require('path');

const client = require('../lib/client');
const indexUnpawall = require('./index/unpaywall.json');
const indexTask = require('./index/task.json');
const { processLogger } = require('../lib/logger');

const changefiles = require('../../fakeUnpaywall/snapshots/changefiles.json');

const isIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    processLogger.error(`Error in indices.exists in isIndexExist: ${err}`);
  }
  return res.body;
}

const createIndexUnpaywall = async () => {
  const exist = await isIndexExist('unpaywall');

  if (exist) {
    try {
      res = await client.indices.delete({
        index: 'unpaywall',
      });
    } catch (err) {
      processLogger.error(`Error in indices.delete in createIndexUnpaywall: ${err}`);
    }
  }
  try {
    await client.indices.create({
      index: 'unpaywall',
      body: indexUnpawall,
    });
  } catch (err) {
    processLogger.error(`Error in indices.create in createIndexUnpaywall: ${err}`);
  }

}

const createIndexTask = async () => {
  const exist = await isIndexExist('task');
  if (exist) {
    try {
      res = await client.indices.delete({
        index: 'task',
      });
    } catch (err) {
      processLogger.error(`Error in indices.delete in createIndexTask: ${err}`);
    }

  }
  try {
    await client.indices.create({
      index: 'task',
      body: indexTask,
    });
  } catch (err) {
    processLogger.error(`Error in indices.delete increateIndexTask: ${err}`);
  }
}

const deleteIndexUnpaywall = async () => {
  const exist = await isIndexExist('unpaywall');
  if (exist) {
    try {
      await client.indices.delete({
        index: 'unpaywall',
      });
    } catch (err) {
      processLogger.error(`Error in deleteIndexUnpaywall: ${err}`);
    }
  }
}

const deleteIndexTask = async () => {
  const exist = await isIndexExist('task');
  if (exist) {
    try {
      await client.indices.delete({
        index: 'task',
      });
    } catch (err) {
      processLogger.error(`Error in deleteIndexTask: ${err}`);
    }
  }
}

const countIndexUnpaywall = async () => {
  const exist = await isIndexExist('unpaywall');
  if (exist) {
    try {
      data = await client.count({
        index: 'unpaywall',
      });
    } catch (err) {
      processLogger.error(`Error in countIndexUnpaywall: ${err}`);
    }
  }
  return data.body.count ? data.body.count : null;
}

const isTaskEnd = async () => {
  const exist = await isIndexExist('task');
  let task;
  if (exist) {
    try {
      task = await client.search({
        index: 'task',
      });
    } catch (err) {
      processLogger.error(`Error in isTaskEnd: ${err}`);
    }
  }
  return task?.body?.hits?.hits[0]?._source?.done;
}

const getTask = async () => {
  const exist = await isIndexExist('task');
  let task;
  if (exist) {
    try {
      task = await client.search({
        index: 'task',
      });
    } catch (err) {
      processLogger.error(`Error in getTask: ${err}`);
    }
  }
  return task?.body?.hits?.hits[0]?._source;
}

const deleteFile = async (name) => {
  const filePath = path.resolve(__dirname, '..', 'out', 'download', name);
  const fileExist = await fs.pathExists(filePath);
  if (fileExist) {
    try {
      await fs.unlinkSync(filePath);
    } catch (err) {
      processLogger.error(`Error in deleteFile: ${err}`);
    }
  }
}

const downloadFile = (name) => new Promise((resolve, reject) => {
  const destination = path.resolve(__dirname, '..', 'out', 'download', name);
  const source = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots', name);

  const readable = fs.createReadStream(source);
  const writable = fs.createWriteStream(destination)

  // download unpaywall file with stream
  const writeStream = readable.pipe(writable);

  writeStream.on('finish', () => {
    processLogger.info(`File ${name} is installed`);
    return resolve();
  });

  writeStream.on('error', (err) => {
    processLogger.error(`Error in downloadFile: ${err}`);
    return reject(err);
  });
});

const initializeDate = async () => {
  const changefilesPath = path.resolve(__dirname, '..', '..', 'fakeUnpaywall', 'snapshots', 'changefiles.json')
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
    await fs.writeFile(changefilesPath, JSON.stringify(changefiles, null, 2), 'utf8')
  } catch (err) {
    processLogger.error(`Error in fs.writeFile in initializeDate: ${err}`);
  }
}

module.exports = {
  createIndexUnpaywall,
  createIndexTask,
  deleteIndexUnpaywall,
  deleteIndexTask,
  countIndexUnpaywall,
  isTaskEnd,
  getTask,
  deleteFile,
  downloadFile,
  initializeDate,
};
