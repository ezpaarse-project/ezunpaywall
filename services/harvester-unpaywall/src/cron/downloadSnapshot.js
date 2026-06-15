const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { getStatus } = require('../lib/update/status');

const { downloadSnapshot } = require('../lib/update/download');

let { active } = cron.downloadSnapshot;

if (typeof active === 'string') {
  active = active.toLowerCase() === 'true';
} else {
  active = Boolean(active);
}

/**
 * Starts regular download snapshot.
 *
 * @returns {Promise<void>}
 */
async function task() {
  appLogger.info('[cron][download-snapshot]: Has started');
  const status = getStatus();
  if (status) {
    appLogger.info('[cron][download-snapshot]: Finished: conflict: an update is already in progress');
    return;
  }

  await downloadSnapshot();
  appLogger.info('[cron][download-snapshot]: Has finished');
}

const downloadSnapshotCron = new Cron('download-snapshot', cron.downloadSnapshot.schedule, task, active);

module.exports = downloadSnapshotCron;
