/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../../lib/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'download');

const deleteSnapshot = async (filename) => {
  const filepath = path.resolve(downloadDir, filename);
  try {
    await fs.remove(filepath);
  } catch (err) {
    logger.error(`deleteSnapshot: ${err}`);
  }
};

module.exports = {
  deleteSnapshot,
};
