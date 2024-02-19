const config = require('config');

const { deleteAllFiles } = require('../../lib/files');
const { removeAllIndices } = require('../../lib/services/elastic');
const unpaywallCron = require('../../lib/cron/unpaywall');
const unpaywallCronHistory = require('../../lib/cron/unpaywallHistory');
const updateChangeFile = require('./snapshot');

const unpaywallCronConfig = config.unpaywallCron;
const unpaywallHistoryCronConfig = config.unpaywallHistoryCron;

/**
 * Reset ezunpaywall
 *
 * @returns {Promise<void>}
 */
async function reset() {
  await deleteAllFiles();
  await removeAllIndices();
  await unpaywallCron.update(unpaywallCronConfig);
  await unpaywallCronHistory.update(unpaywallHistoryCronConfig);
  await updateChangeFile('week');
}

module.exports = reset;
