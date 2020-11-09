const path = require('path');
const fs = require('fs-extra');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');

const client = require('../../lib/client');
const { processLogger } = require('../../lib/logger');

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
  done: false,
  currentTask: '',
  steps: [],
  createdAt: null,
  endAt: null,
  took: '',
};

const getTask = () => task;

const resetTask = () => {
  iteratorTask = -1;
  iteratorFile = -1;
  metadatas = [];
  task.done = false;
  task.currentTask = '';
  task.steps = [];
  task.createdAt = null;
  task.endAt = null;
  task.took = '';
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
  processLogger.info('step - fetch unpaywall');
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
  processLogger.info('step - start download file');
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
  processLogger.info(`step - start insertion with ${file}`);
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
    processLogger(err);
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
      processLogger(err);
    }
  }());
};

const endStatus = async () => {
  try {
    clearTimeout(timeout);
    await client.index({
      id: idTask,
      index: 'task',
      refresh: true,
      body: task,
    });
  } catch (err) {
    processLogger.error(err);
  }
};

const createReport = async (success) => {
  try {
    await fs.writeFileSync(`${reportDir}/${success}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(task, null, 2));
  } catch (error) {
    processLogger.error(error);
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
