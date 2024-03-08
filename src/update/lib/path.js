const path = require('path');

const dataDir = path.resolve(__dirname, '..', 'data');
const snapshotsDir = path.resolve(dataDir, 'snapshots');
const reportsDir = path.resolve(dataDir, 'reports');

const dirPath = {
  dataDir,
  snapshotsDir,
  reportsDir,
};

module.exports = dirPath;
