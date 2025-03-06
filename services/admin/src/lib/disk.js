const fsp = require('fs/promises');

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(decimals)} ${sizes[i]}`;
}

async function getDiskSpace() {
  return fsp.statfs(__dirname);
}

module.exports = {
  formatBytes,
  getDiskSpace,
};
