const path = require('path');
const fsp = require('fs/promises');
const { format } = require('date-fns');
const { paths } = require('config');
const appLogger = require('../logger/appLogger');

/**
 * Create report on the folder as name the date of process.
 *
 * @param {Object} state - State of process.
 *
 * @returns {Promise<void>}
 */
async function createReport(state) {
  const { name } = state;
  appLogger.info(`[report]: Create new report for ${name}`);
  const filepath = path.resolve(paths.data.reportsDir, `${format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS")}_${name}.json`);
  try {
    await fsp.writeFile(filepath, JSON.stringify(state, null, 2));
  } catch (err) {
    appLogger.error(`[report] Cannot write [${JSON.stringify(state, null, 2)}] in ${filepath}`, err);
    throw err;
  }
  appLogger.debug('[report]: Report created');
}

/**
 * Get report from the folder data depending on type.
 *
 * @param {string} filename Report filename.
 *
 * @returns {Promise<Object>} Report in json format.
 */
async function getReport(filename) {
  let report;
  const filepath = path.resolve(paths.data.reportsDir, filename);
  try {
    report = await fsp.readFile(filepath);
  } catch (err) {
    appLogger.error(`[report] Cannot read [${filepath}]`, err);
    throw err;
  }
  try {
    report = JSON.parse(report);
  } catch (err) {
    appLogger.error(`[report] Cannot parse [${report}] at json format`, err);
    throw err;
  }
  return report;
}

module.exports = {
  createReport,
  getReport,
};
