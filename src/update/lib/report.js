const path = require('path');
const fs = require('fs-extra');
const { format } = require('date-fns');
const logger = require('./logger');
const { getPathOfDirectory } = require('./files');

/**
 * Create report on the folder as name the date of process.
 *
 * @param {Object} state - State of process.
 *
 * @returns {Promise<void>}
 */
async function createReport(state) {
  logger.info(`[report]: create new report for [${state.type}]`);
  const { type } = state;
  const pathOfDirectory = getPathOfDirectory(type, 'reports');
  const filepath = path.resolve(pathOfDirectory, `${format(new Date(), 'yyyy-MM-dd_HH:mm:ss')}.json`);
  try {
    await fs.writeFile(filepath, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`[report] Cannot write [${JSON.stringify(state, null, 2)}] in ${filepath}`, err);
    throw err;
  }
  logger.debug('[report]: report created');
}

/**
 * Get report from the folder data depending on type.
 *
 * @param {string} type - Type of report (unpaywall or unpaywallHistory).
 * @param {string} filename - Report filename.
 *
 * @returns {Promise<Object>} Report in json format.
 */
async function getReport(type, filename) {
  let report;
  const pathOfDirectory = getPathOfDirectory(type, 'reports');
  try {
    report = await fs.readFile(path.resolve(pathOfDirectory, filename));
  } catch (err) {
    logger.error(`[report] Cannot read [${path.resolve(pathOfDirectory, filename)}]`, err);
    throw err;
  }
  try {
    report = JSON.parse(report);
  } catch (err) {
    logger.error(`[report] Cannot parse [${report}] at json format`, err);
    throw err;
  }
  return report;
}

module.exports = {
  createReport,
  getReport,
};
