const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const snapshotsDir = path.resolve(dataDir, 'snapshots');

const unpaywallDir = path.resolve(dataDir, 'unpaywall');

const unpaywallReportsDir = path.resolve(unpaywallDir, 'reports');

const unpaywallHistoryDir = path.resolve(dataDir, 'unpaywallHistory');

const unpaywallHistoryReportsDir = path.resolve(unpaywallHistoryDir, 'reports');

const dirPath = {
  dataDir,
  snapshotsDir,
  unpaywall: {
    reportsDir: unpaywallReportsDir,
  },
  unpaywallHistory: {
    reportsDir: unpaywallHistoryReportsDir,
  },
};

module.exports = dirPath;
