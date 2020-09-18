const client = require('../../client/client');

let iteratorTask = -1;
const iteratorFile = 0;
const metadatas = [];

const getIteratorTask = () => iteratorTask;
const getIteratorFile = () => iteratorFile;

let tasks = {
  done: false,
  currentTask: '',
  steps: [],
  createdAt: '',
  endAt: '',
  took: '',
};

const resetTask = () => {
  iteratorTask = -1;
  tasks = {
    done: false,
    currentTask: '',
    steps: [],
    createdAt: '',
    endAt: '',
    took: '',
  };
};

const createStepFetchUnpaywall = () => {
  iteratorTask += 1;
  tasks.currentTask = 'fetchUnpaywall';
  tasks.steps.push(
    {
      task: 'fetchUnpaywall',
      result: {
        took: 0,
        status: 'inProgress',
      },
    },
  );
  return new Date();
};

const createStepDownload = (file) => {
  iteratorTask += 1;
  tasks.currentTask = 'download';
  tasks.steps.push(
    {
      task: 'download',
      result: {
        file,
        percent: 0,
        took: 0,
        status: 'inProgress',
      },
    },
  );
  return new Date();
};

const createStepInsert = (file) => {
  iteratorTask += 1;
  tasks.currentTask = 'insert';
  tasks.steps.push(
    {
      task: 'insert',
      result: {
        file,
        lineRead: 0,
        took: 0,
        status: 'inProgress',
      },
    },
  );
  return new Date();
};

const createStatus = async () => {
  const doc = await client.index({
    index: 'tasks',
    body: {
      tasks,
    },
  });
  console.log(doc.body._id);
  let timeout;
  (async function actualizeStatus() {
    console.log(tasks);
    if (tasks.done) {
      clearTimeout(timeout);
      return;
    }
    try {
      // TODO j'en était à la
      await client.index({
        id: doc.body._id,
        index: 'unpaywall',
        refresh: true,
        body: {
          doc: {
            tasks,
          },
        },
      });
      timeout = setTimeout(actualizeStatus, 3000);
    } catch (err) {
      console.log(err);
    }
  }());
};

const fail = (startDate) => {
  tasks.steps[iteratorTask].result.status = 'error';
  tasks.steps[iteratorTask].result.took = (startDate - new Date()) / 1000;
  resetTask();
};

module.exports = {
  tasks,
  metadatas,
  getIteratorTask,
  getIteratorFile,
  createStepFetchUnpaywall,
  createStepDownload,
  createStepInsert,
  createStatus,
  fail,
};
