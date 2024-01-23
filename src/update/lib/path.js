const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const snapshotsDir = path.resolve(dataDir, 'snapshots');

const unpaywallDir = path.resolve(dataDir, 'unpaywall');

const unpaywallReportsDir = path.resolve(unpaywallDir, 'reports');
const unpaywallStatesDir = path.resolve(unpaywallDir, 'states');

const unpaywallHistoryDir = path.resolve(dataDir, 'unpaywallHistory');

const unpaywallHistoryReportsDir = path.resolve(unpaywallHistoryDir, 'reports');
const unpaywallHistoryStatesDir = path.resolve(unpaywallHistoryDir, 'states');

const dirPath = {
  dataDir,
  snapshotsDir,
  unpaywall: {
    reportsDir: unpaywallReportsDir,
    statesDir: unpaywallStatesDir,
  },
  unpaywallHistory: {
    reportsDir: unpaywallHistoryReportsDir,
    statesDir: unpaywallHistoryStatesDir,
  },
};

module.exports = dirPath;
