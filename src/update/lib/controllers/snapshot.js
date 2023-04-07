/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');

const logger = require('../logger');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

/**
 * Delete file installed on ezunpaywall on "/data/snapshots".
 *
 * @param {string} filename - Filename.
 *
 * @returns {Promise<void>}
 */
async function deleteFile(filename) {
  const filepath = path.resolve(snapshotsDir, filename);
  try {
    await fs.remove(filepath);
  } catch (err) {
    logger.error(`[file] Cannot remove [${filepath}]`, err);
    throw err;
  }
}

module.exports = {
  deleteFile,
};
