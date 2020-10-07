const path = require('path');
const fs = require('fs-extra');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');

const client = require('../../lib/client');
const { processLogger } = require('../../lib/logger');

let iteratorTask = -1;
let iteratorFile = 0;
let metadatas = [];
let timeout;

const getIteratorFile = () => iteratorFile;
const getMetadatas = () => metadatas;
const setIteratorFile = (val) => {
  iteratorFile += val;
};

let idTask;

const tasks = {
  done: false,
  currentTask: '',
  steps: [],
  createdAt: null,
  endAt: null,
  took: '',
};

const getTasks = () => tasks;

const resetTasks = () => {
  iteratorTask = -1;
  iteratorFile = 0;
  metadatas = [];
  tasks.done = false;
  tasks.currentTask = '';
  tasks.steps = [];
  tasks.createdAt = null;
  tasks.endAt = null;
  tasks.took = '';
};

const endTask = () => {
  tasks.endAt = new Date();
  tasks.took = (tasks.endAt - tasks.createdAt) / 1000;
  tasks.done = true;
  tasks.currentTask = 'end';
};

const startTask = () => {
  tasks.done = false;
  tasks.createdAt = new Date();
};

const createStepFetchUnpaywall = () => {
  processLogger.info('step - fetch unpaywall');
  iteratorTask += 1;
  tasks.currentTask = 'fetchUnpaywall';
  tasks.steps.push(
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
  tasks.currentTask = 'download';
  tasks.steps.push(
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
  processLogger.info('step - start insertion');
  iteratorTask += 1;
  tasks.currentTask = 'insert';
  tasks.steps.push(
    {
      task: 'insert',
      file,
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
      index: 'tasks',
      refresh: true,
      body: tasks,
    });
    idTask = doc.body._id;
  } catch (err) {
    console.log(err);
  }
  (async function actualizeStatus() {
    if (tasks.done) {
      clearTimeout(timeout);
      return;
    }
    try {
      await client.index({
        id: idTask,
        index: 'tasks',
        refresh: true,
        body: tasks,
      });
      timeout = setTimeout(actualizeStatus, 3000);
    } catch (err) {
      console.log(err);
    }
  }());
};

const endStatus = async () => {
  try {
    clearTimeout(timeout);
    await client.index({
      id: idTask,
      index: 'tasks',
      refresh: true,
      body: tasks,
    });
  } catch (err) {
    processLogger.error(err);
  }
};

const createReport = async (success) => {
  try {
    await fs.writeFileSync(`${reportDir}/${success}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(tasks, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

const fail = (startDate) => {
  tasks.steps[iteratorTask].status = 'error';
  tasks.steps[iteratorTask].took = (startDate - new Date()) / 1000;
  tasks.endAt = (tasks.createdAt - new Date()) / 1000;
  createReport('error');
  resetTasks();
};

module.exports = {
  tasks,
  getMetadatas,
  getIteratorFile,
  setIteratorFile,
  createStepFetchUnpaywall,
  createStepDownload,
  createStepInsert,
  createStatus,
  getTasks,
  endStatus,
  resetTasks,
  endTask,
  startTask,
  fail,
  createReport,
};
