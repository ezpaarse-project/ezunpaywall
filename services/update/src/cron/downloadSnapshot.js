const { cron } = require('config');
const logger = require('../logger/appLogger');

const Cron = require('./cron');
const { getStatus } = require('../lib/status');

const { downloadSnapshot } = require('../process/download');

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
    logger.info(`[cron][${this.name}]: conflict: an update is already in progress`);
    return;
  }

  await downloadSnapshot();
}

const downloadSnapshotCron = new Cron('Download snapshot', cron.downloadSnapshot.schedule, task, active);

module.exports = downloadSnapshotCron;
