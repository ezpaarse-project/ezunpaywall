const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');

const unpaywallDir = path.resolve(dataDir, 'unpaywall');

const unpaywallReportsDir = path.resolve(unpaywallDir, 'reports');
const unpaywallStatesDir = path.resolve(unpaywallDir, 'states');
const unpaywallSnapshotsDir = path.resolve(unpaywallDir, 'snapshots');

const unpaywallHistoryDir = path.resolve(dataDir, 'unpaywallHistory');

const unpaywallHistoryReportsDir = path.resolve(unpaywallHistoryDir, 'reports');
const unpaywallHistoryStatesDir = path.resolve(unpaywallHistoryDir, 'states');
const unpaywallHistorySnapshotsDir = path.resolve(unpaywallHistoryDir, 'snapshots');

const dirPath = {
  dataDir,
  unpaywall: {
    reportsDir: unpaywallReportsDir,
    statesDir: unpaywallStatesDir,
    snapshotsDir: unpaywallSnapshotsDir,
  },
  unpaywallHistory: {
    reportsDir: unpaywallHistoryReportsDir,
    statesDir: unpaywallHistoryStatesDir,
    snapshotsDir: unpaywallHistorySnapshotsDir,
  },
};

module.exports = dirPath;
