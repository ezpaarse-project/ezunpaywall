const path = require('path');
const fs = require('fs-extra');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');

const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

let iteratorTask = -1;
let iteratorFile = -1;
let metadatas = [];
let timeout;

const getIteratorFile = () => iteratorFile;
const getMetadatas = () => metadatas;
const setIteratorFile = (val) => {
  iteratorFile += val;
};

let idTask;

const task = {
  done: true,
  currentTask: '',
  steps: [],
  createdAt: null,
  endAt: null,
  took: 0,
};

const getTask = () => task;

const resetTask = () => {
  iteratorTask = -1;
  iteratorFile = -1;
  metadatas = [];
  task.done = true;
  task.currentTask = '';
  task.steps = [];
  task.createdAt = null;
  task.endAt = null;
  task.took = 0;
};

const endTask = () => {
  task.endAt = new Date();
  task.took = (task.endAt - task.createdAt) / 1000;
  task.done = true;
  task.currentTask = 'end';
};

const startTask = () => {
  task.done = false;
  task.createdAt = new Date();
};

const createStepFetchUnpaywall = () => {
  logger.info('step - fetch unpaywall');
  iteratorTask += 1;
  task.currentTask = 'fetchUnpaywall';
  task.steps.push(
    {
      task: 'fetchUnpaywall',
      took: 0,
      status: 'inProgress',
    },
  );
  return new Date();
};

const createStepDownload = (file) => {
  logger.info('step - start download file');
  iteratorTask += 1;
  task.currentTask = 'download';
  task.steps.push(
    {
      task: 'download',
      file,
      percent: 0,
      took: 0,
      status: 'inProgress',
    },
  );
  return new Date();
};

const createStepInsert = (file) => {
  logger.info(`step - start insertion with ${file}`);
  iteratorTask += 1;
  task.currentTask = 'insert';
  task.steps.push(
    {
      task: 'insert',
      file,
      percent: 0,
      lineRead: 0,
      took: 0,
      status: 'inProgress',
    },
  );
  return new Date();
};

const createStatus = async () => {
  try {
    const doc = await client.index({
      index: 'task',
      refresh: true,
      body: task,
    });
    idTask = doc.body._id;
  } catch (err) {
    logger.error(`Error in createStatus: ${err}`);
  }
  (async function actualizeStatus() {
    if (task.done) {
      clearTimeout(timeout);
      return;
    }
    try {
      await client.index({
        id: idTask,
        index: 'task',
        refresh: true,
        body: task,
      });
      timeout = setTimeout(actualizeStatus, 3000);
    } catch (err) {
      logger.error(`Error in actualizeStatus: ${err}`);
    }
  }());
};

const endStatus = async () => {
  clearTimeout(timeout);
  try {
    await client.index({
      id: idTask,
      index: 'task',
      refresh: true,
      body: task,
    });
  } catch (err) {
    logger.error(`Error in endStatus: ${err}`);
  }
};

const createReport = async (success) => {
  try {
    await fs.writeFileSync(`${reportDir}/${success}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(task, null, 2));
  } catch (err) {
    logger.error(`Error in createReport: ${err}`);
  }
};

const fail = (startDate) => {
  task.steps[iteratorTask].status = 'error';
  task.steps[iteratorTask].took = (startDate - new Date()) / 1000;
  task.endAt = (task.createdAt - new Date()) / 1000;
  createReport('error');
  resetTask();
};

module.exports = {
  task,
  getMetadatas,
  getIteratorFile,
  setIteratorFile,
  createStepFetchUnpaywall,
  createStepDownload,
  createStepInsert,
  createStatus,
  getTask,
  endStatus,
  resetTask,
  endTask,
  startTask,
  fail,
  createReport,
};
