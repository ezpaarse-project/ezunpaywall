const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./logger');

const tmpDir = path.resolve(__dirname, '..', 'out', 'tmp');

const deleteTmpFile = async () => {
  const files = await fs.readdir(tmpDir);
  files.forEach(async (file) => {
    const stats = await fs.stat(path.join(tmpDir, file));
    const now = Date.now();
    const oneHour = 1000 * 60 * 60;
    if (stats.mtime < (now - oneHour)) {
      fs.unlink(path.join(tmpDir, file));
    }
  });
};

module.exports = {
  deleteTmpFile,
};
