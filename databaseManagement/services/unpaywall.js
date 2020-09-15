const path = require('path');
const fs = require('fs-extra');
const client = require('../../client/client');
const { processLogger } = require('../../logger/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');

let statusWeekly = {
  inProcess: false,
  route: '',
  status: '',
  currentFile: '',
  askAPI: {
    success: '',
    took: '',
  },
  download: {
    size: '',
    percent: '',
    took: '',
  },
  upsert: {
    read: 0,
    total: 0,
    percent: 0,
    lineProcessed: 0,
    took: '',
  },
  createdAt: '',
  endAt: '',
  took: '',
};

let statusManually = {
  inProcess: false,
  route: '',
  status: '',
  currentFile: '',
  upsert: {
    read: 0,
    lineProcessed: 0,
  },
  createdAt: '',
  endAt: '',
  took: '',
};

let statusByDate = {
  inProcess: false,
  route: '',
  status: '',
  currentFile: '',
  download: {
    size: '',
    percent: '',
    took: '',
  },
  upsert: {
    read: 0,
    percent: 0,
    lineProcessed: 0,
  },
  createdAt: '',
  endAt: '',
  took: '',
};

const resetStatus = () => {
  statusWeekly = Object.assign(statusWeekly, {
    inProcess: false,
    route: '',
    status: '',
    currentFile: '',
    askAPI: {
      success: '',
      took: '',
    },
    download: {
      size: '',
      percent: '',
      took: '',
    },
    upsert: {
      read: 0,
      total: 0,
      percent: 0,
      lineProcessed: 0,
      took: '',
    },
    createdAt: '',
    endAt: '',
    took: '',
  });
  statusManually = Object.assign(statusManually, {
    inProcess: false,
    route: '',
    status: '',
    currentFile: '',
    upsert: {
      read: 0,
      percent: 0,
      lineProcessed: 0,
    },
    createdAt: '',
    endAt: '',
    took: '',
  });
  statusByDate = Object.assign(statusByDate, {
    inProcess: false,
    route: '',
    status: '',
    currentFile: '',
    download: {
      size: '',
      percent: '',
      took: '',
    },
    upsert: {
      read: 0,
      percent: 0,
      lineProcessed: 0,
    },
    createdAt: '',
    endAt: '',
    took: '',
  });
};

const getStatus = () => {
  if (statusManually.inProcess) return statusManually;
  if (statusWeekly.inProcess) return statusWeekly;
  if (statusByDate.inProcess) return statusByDate;
  return false;
};

const createReport = async (status, route) => {
  try {
    await fs.writeFileSync(`${reportDir}/${route}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(status, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

/**
 * @param {*} data array of unpaywall datas
 */
const upsertUPW = async (data) => {
  const body = data.flatMap((doc) => [{ index: { _index: 'unpaywall' } }, doc]);
  const { body: bulkResponse } = await client.bulk({ refresh: true, body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }
};

module.exports = {
  upsertUPW,
  createReport,
  resetStatus,
  getStatus,
  statusWeekly,
  statusManually,
  statusByDate,
};
