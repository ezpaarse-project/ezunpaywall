const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

const isIndexExist = async (name) => {
  let res;
  try {
    res = await client.indices.exists({
      index: name,
    });
  } catch (err) {
    logger.error(`indices.exists in isIndexExist: ${err}`);
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
      logger.error(`deleteIndex: ${err}`);
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
    logger.error(`indices.delete increateIndex: ${err}`);
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
      logger.error(`countDocuments: ${err}`);
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
      logger.error(`isTaskEnd: ${err}`);
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
      logger.error(`getTask: ${err}`);
    }
  }
  return task?.body?.hits?.hits[0]?._source;
};

module.exports = {
  createIndex,
  deleteIndex,
  countDocuments,
  isTaskEnd,
  getTask,
};
