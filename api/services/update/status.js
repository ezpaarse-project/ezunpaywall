const path = require('path');
const fs = require('fs-extra');
const config = require('config');
const { sendMail, generateMail } = require('../../lib/mail');

const reportDir = path.resolve(__dirname, '..', 'out', 'reports');

const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

let iteratorTask = -1;
let iteratorFile = -1;
let metadata = [];
let timeout;

const getIteratorFile = () => iteratorFile;
const getMetadata = () => metadata;
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
  metadata = [];
  task.done = true;
  task.currentTask = '';
  task.steps = [];
  task.createdAt = null;
  task.endAt = null;
  task.took = 0;
};

const endTask = () => {
  task.endAt = new Date();
  task.took = Math.round((task.endAt - task.createdAt) / 1000);
  task.done = true;
  task.currentTask = 'end';
};

const startTask = () => {
  task.done = false;
  task.createdAt = new Date();
};

const mailUpdate = async (status) => {
  try {
    await sendMail({
      from: config.get('notifications.sender'),
      to: config.get('notifications.receivers'),
      subject: `ezunpaywall - Rapport de mise à jour - ${status}`,
      ...generateMail('report', {
        task: JSON.stringify(task, null, 2),
        status,
        date: new Date().toISOString().slice(0, 10),
      }),
    });
  } catch (err) {
    logger.error(`mailUpdate : ${err}`);
  }
};

const createStepaskUnpaywall = () => {
  logger.info('step - ask unpaywall');
  iteratorTask += 1;
  task.currentTask = 'askUnpaywall';
  task.steps.push(
    {
      task: 'askUnpaywall',
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
      linesRead: 0,
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
    logger.error(`createStatus: ${err}`);
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
      logger.error(`actualizeStatus: ${err}`);
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
    logger.error(`endStatus: ${err}`);
  }
};

const createReport = async (success) => {
  try {
    await fs.writeFileSync(`${reportDir}/${success}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(task, null, 2));
  } catch (err) {
    logger.error(`createReport: ${err}`);
  }
  await mailUpdate(success);
};

const fail = async (startDate) => {
  task.done = true;
  task.steps[iteratorTask].status = 'error';
  task.steps[iteratorTask].took = (Date.now() - startDate) / 1000;
  task.endAt = new Date();
  await createReport('error');
  resetTask();
};

module.exports = {
  task,
  getMetadata,
  getIteratorFile,
  setIteratorFile,
  createStepaskUnpaywall,
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
