const path = require('path');
const fs = require('fs-extra');
const UnPayWallModel = require('../../apiGraphql/unpaywall/model');
const { processLogger } = require('../../logger/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');
const statusDir = path.resolve(__dirname, '..', '..', 'out', 'status');

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
    percent: 0,
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

const databaseStatus = async () => {
  const statusDB = {};
  statusDB.doi = await UnPayWallModel.count({});
  statusDB.is_oa = await UnPayWallModel.count({
    where: {
      is_oa: 'true',
    },
  });
  statusDB.journal_issn_l = await UnPayWallModel.count({
    col: 'journal_issn_l',
    distinct: true,
  });
  statusDB.publisher = await UnPayWallModel.count({
    col: 'publisher',
    distinct: true,
  });
  statusDB.gold = await UnPayWallModel.count({
    where: {
      oa_status: 'gold',
    },
  });
  statusDB.hybrid = await UnPayWallModel.count({
    where: {
      oa_status: 'hybrid',
    },
  });
  statusDB.bronze = await UnPayWallModel.count({
    where: {
      oa_status: 'bronze',
    },
  });
  statusDB.green = await UnPayWallModel.count({
    where: {
      oa_status: 'green',
    },
  });
  statusDB.closed = await UnPayWallModel.count({
    where: {
      oa_status: 'closed',
    },
  });
  return statusDB;
};

const getStatus = () => {
  if (statusManually.inProcess) return statusManually;
  if (statusWeekly.inProcess) return statusWeekly;
  if (statusByDate.inProcess) return statusByDate;
  return false;
};

const createStatus = async () => {
  const dbStatus = await databaseStatus();
  fs.writeFileSync(`${statusDir}/status-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(dbStatus, null, 2));
};

const createReport = async (status, route) => {
  try {
    await fs.writeFileSync(`${reportDir}/${route}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(status, null, 2));
  } catch (error) {
    processLogger.error(error);
  }
};

/**
 * bulk upsert one database
 * @param {*} data array of unpaywall datas
 */
const upsertUPW = async (data) => {
  const raw = [
    'best_oa_location',
    'data_standard',
    'doi_url',
    'genre',
    'is_paratext',
    'is_oa',
    'journal_is_in_doaj',
    'journal_is_oa',
    'journal_issns',
    'journal_issn_l',
    'journal_name',
    'oa_locations',
    'oa_status',
    'published_date',
    'publisher',
    'title',
    'updated',
    'year',
    'z_authors',
    'createdAt',
  ];
  try {
    await UnPayWallModel.bulkCreate(data, { updateOnDuplicate: raw });
    return true;
  } catch (error) {
    processLogger.error(`ERROR IN UPSERT : ${error}`);
    return false;
  }
};

const getTotalLine = async () => {
  const res = await UnPayWallModel.count({});
  return res;
};

module.exports = {
  upsertUPW,
  getTotalLine,
  createReport,
  resetStatus,
  getStatus,
  createStatus,
  statusWeekly,
  statusManually,
  statusByDate,
};
