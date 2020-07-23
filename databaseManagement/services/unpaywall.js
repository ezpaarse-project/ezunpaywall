const path = require('path');
const fs = require('fs-extra');
const UnPayWallModel = require('../../apiGraphql/unpaywall/model');
const { processLogger } = require('../../logger/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'reports');
const statusDir = path.resolve(__dirname, '..', '..', 'out', 'status');

// this object is visible at /process/status
const statusWeekly = {
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

// this object is visible at /process/status
const statusManually = {
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
  if (statusManually.inProcess) {
    return statusManually;
  }
  return statusWeekly;
};

let currentStatus = {};
const resetStatusWeekly = () => {
  currentStatus = Object.assign(statusWeekly, {});
};

const resetStatusManually = () => {
  currentStatus = Object.assign(statusManually, {});
};

const createStatus = async () => {
  const dbStatus = await databaseStatus();
  fs.writeFileSync(`${statusDir}/status-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(dbStatus, null, 2));
};

const createReport = (route) => {
  try {
    fs.writeFileSync(`${reportDir}/${route}-${new Date().toISOString().slice(0, 16)}.json`, JSON.stringify(currentStatus, null, 2));
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
  await UnPayWallModel.count({});
};

module.exports = {
  upsertUPW,
  getTotalLine,
  createReport,
  resetStatusWeekly,
  resetStatusManually,
  getStatus,
  createStatus,
  statusWeekly,
  statusManually,
};
