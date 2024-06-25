const {
  deleteSnapshot,
} = require('./snapshot');

const {
  deleteChangefile,
} = require('./changefile');

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
  await deleteChangefile('2020-01-02-history.jsonl.gz');
  await deleteChangefile('2020-01-03-history.jsonl.gz');
  await deleteChangefile('2020-01-05-history.jsonl.gz');
  await deleteChangefile('fake1.jsonl.gz');
  await deleteChangefile('fake2.jsonl.gz');
  await deleteChangefile('fake3.jsonl.gz');
  await deleteChangefile('fake1-error.jsonl.gz');
  await deleteSnapshot('2019-01-01-snapshot.jsonl.gz');
  await deleteSnapshot('2020-01-01-snapshot.jsonl.gz');
  await deleteIndex('unpaywall');
  await deleteIndex('unpaywall-test');
  await deleteIndex('unpaywall_base');
  await deleteIndex('unpaywall_history');
  await deleteIndex('unpaywall_tmp');
  await resetCronConfig('unpaywall');
  await resetCronConfig('unpaywallHistory');
}

module.exports = reset;
