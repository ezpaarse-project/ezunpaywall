const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { getStatus } = require('../lib/update/status');

const { downloadSnapshot } = require('../lib/update/download');

let { active } = cron.downloadSnapshot;

if (active === 'true' || active) active = true;
else active = false;

/**
 * Starts regular download snapshot.
 *
 * @returns {Promise<void>}
 */
async function task() {
  const status = getStatus();
  if (status) {
    appLogger.info(`[cron][${this.name}]: conflict: an update is already in progress`);
    return;
  }

  await downloadSnapshot();
}

const downloadSnapshotCron = new Cron('Download snapshot', cron.downloadSnapshot.schedule, task, active);

module.exports = downloadSnapshotCron;
