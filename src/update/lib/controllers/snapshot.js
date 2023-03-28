/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');

const logger = require('../logger');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

/**
 * Delete file installed on ezunpaywall on "/data/snapshots".
 *
 * @param {String} filename - Filename.
 */
const deleteFile = async (filename) => {
  const filepath = path.resolve(snapshotsDir, filename);
  try {
    await fs.remove(filepath);
  } catch (err) {
    logger.error(`Cannot remove ${filepath}`);
    logger.error(err);
  }
};

module.exports = {
  deleteFile,
};
