const fs = require('fs-extra')
const path = require('path');

const client = require('../lib/client');
const indexUnpawall = require('./index/unpaywall.json');
const indexTask = require('./index/task.json');
const { processLogger } = require('../lib/logger');

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
  try {
    await fs.unlinkSync(filePath);
  } catch (err) {
    processLogger.error(`Error in deleteFile: ${err}`);
  }
}

const dowloadFile = async (name) => {

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
};
