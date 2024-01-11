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
  await deleteFile('unpaywall', 'history1.jsonl.gz');
  await deleteFile('unpaywall', 'history2.jsonl.gz');
  await deleteFile('unpaywall', 'history3.jsonl.gz');
  await deleteFile('unpaywall', 'fake1.jsonl.gz');
  await deleteFile('unpaywall', 'fake2.jsonl.gz');
  await deleteFile('unpaywall', 'fake3.jsonl.gz');
  await deleteFile('unpaywall', 'fake1-error.jsonl.gz');
  await deleteFile('unpaywall', 'snapshot.jsonl.gz');
  await deleteIndex('unpaywall-test');
  await deleteIndex('unpaywall_enriched');
  await deleteIndex('unpaywall_history');
  await resetCronConfig('unpaywall');
  await resetCronConfig('unpaywallHistory');
}

module.exports = reset;
