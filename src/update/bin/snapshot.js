/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');

const { logger } = require('../lib/logger');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const deleteSnapshot = async (filename) => {
  const filepath = path.resolve(snapshotsDir, filename);
  try {
    await fs.remove(filepath);
  } catch (err) {
    logger.error(`deleteSnapshot: ${err}`);
  }
};

module.exports = {
  deleteSnapshot,
};
