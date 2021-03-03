const fs = require('fs-extra');
const path = require('path');
const { logger } = require('./logger');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');

const deleteEnrichedFile = async () => {
  const files = await fs.readdir(enrichedDir);
  files.forEach(async (file) => {
    const stats = await fs.stat(path.join(enrichedDir, file));
    const now = Date.now();
    const oneHour = 1000 * 60 * 60;
    if (stats.mtime < (now - oneHour)) {
      fs.unlink(path.join(enrichedDir, file));
    }
  });
};

module.exports = {
  deleteEnrichedFile,
};
