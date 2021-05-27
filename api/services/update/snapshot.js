/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../../lib/logger');

const downloadDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'download');

const deleteSnapshot = async (filename) => {
  const filepath = path.resolve(downloadDir, filename);
  try {
    await fs.unlink(filepath);
  } catch (err) {
    logger.error(`deleteSnapshot: ${err}`);
  }
};

const addSnapshot = async (readStream, filename) => {

  const filepath = path.resolve(downloadDir, filename);
  let alreadyInstalled;
  try {
    alreadyInstalled = await fs.pathExists(path.resolve(downloadDir, filename));
  } catch (err) {
    logger.error(`addSnapshot in fs.pathExists: ${err}`);
  }
  if (alreadyInstalled) {
    try {
      await fs.remove(filepath);
    } catch (err) {
      logger.error(`addSnapshot in fs.remove: ${err}`);
    }
  }
  // le readstream a une ligne en trop au début et à la fin et c'est fucked
  await readStream.pipe(fs.createWriteStream(filepath));
};

module.exports = {
  deleteSnapshot,
  addSnapshot,
};
