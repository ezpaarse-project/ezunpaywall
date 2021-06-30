/* eslint-disable no-await-in-loop */
const fs = require('fs-extra');
const path = require('path');

const enrichedDir = path.resolve(__dirname, '..', 'out', 'enrich', 'enriched');

const deleteEnrichedFile = async () => {
  const files = await fs.readdir(enrichedDir);
  for (let i = 0; i < files.length; i += 1) {
    const stats = await fs.stat(path.join(enrichedDir, files[i]));
    const now = Date.now();
    const oneHour = 1000 * 60 * 60;
    if (stats.mtime < (now - oneHour)) {
      await fs.remove(path.join(enrichedDir, files[i]));
    }
  }
};

module.exports = {
  deleteEnrichedFile,
};
