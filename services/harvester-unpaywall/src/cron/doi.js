const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { getCount, reset } = require('../lib/doi');

let { active } = cron.doiUpdate;

if (typeof active === 'string') {
  active = active.toLowerCase() === 'true';
} else {
  active = Boolean(active);
}

/**
 * Reset count of update doi.
 *
 * @returns {Promise<void>}
 */
async function task() {
  appLogger.info('[cron][DOI-update]: Has started');
  const count = getCount();
  reset();
  appLogger.info(`[cron][DOI-update]: ${count} DOIs reset`);
  appLogger.info('[cron][DOI-update]: Has finished');
}

const doiUpdateCron = new Cron('DOI-update', cron.doiUpdate.schedule, task, active);

module.exports = doiUpdateCron;
