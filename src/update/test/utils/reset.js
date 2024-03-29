const {
  deleteFile,
} = require('./snapshot');

const {
  deleteIndex,
} = require('./elastic');

const resetCronConfig = require('./cron');

/**
 * Reset ezunpaywall
 *
 * @returns {Promise<void>}
 */
async function reset() {
  await deleteFile('fake1.jsonl.gz');
  await deleteFile('fake2.jsonl.gz');
  await deleteFile('fake3.jsonl.gz');
  await deleteFile('fake1-error.jsonl.gz');
  await deleteFile('snapshot.jsonl.gz');
  await deleteIndex('unpaywall-test');
  await resetCronConfig();
}

module.exports = reset;
