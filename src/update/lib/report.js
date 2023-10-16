const path = require('path');
const fs = require('fs-extra');
const { format } = require('date-fns');
const logger = require('./logger');

const reportsDir = path.resolve(__dirname, '..', 'data', 'reports');

/**
 * Create report on the folder "data/update/report" on behalf of the date of treatment.
 *
 * @param {string} state - State filename.
 *
 * @returns {Promise<void>}
 */
async function createReport(state) {
  const pathfile = path.resolve(reportsDir, `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.json`);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[report] Cannot write [${JSON.stringify(state, null, 2)}] in ${pathfile}`, err);
    throw err;
  }
}

/**
 * Get report from the folder "data/update/report".
 *
 * @param {string} filename - Report filename.
 *
 * @returns {Promise<Object>} Report in json format.
 */
async function getReport(filename) {
  let report;
  try {
    report = await fs.readFile(path.resolve(reportsDir, filename));
  } catch (err) {
    logger.error(`[report] Cannot read [${path.resolve(reportsDir, filename)}]`, err);
    return undefined;
  }
  try {
    report = JSON.parse(report);
  } catch (err) {
    logger.error(`[report] Cannot parse [${report}] at json format`, err);
    return undefined;
  }
  return report;
}

module.exports = {
  createReport,
  getReport,
};
