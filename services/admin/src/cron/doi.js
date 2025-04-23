const { cron } = require('config');
const appLogger = require('../lib/logger/appLogger');

const Cron = require('./cron');
const { setCount } = require('../lib/update/doi');

let { active } = cron.doiUpdate;

if (active === 'true' || active) active = true;
else active = false;

/**
 * Reset count of update doi.
 *
 * @returns {Promise<void>}
 */
async function task() {
  appLogger.info('[cron][updateDOI]: Has started');
  setCount(0);
  appLogger.info('[cron][updateDOI]: Has finished');
}

const doiUpdateCron = new Cron('updateDOI', cron.doiUpdate.schedule, task, active);

module.exports = doiUpdateCron;
