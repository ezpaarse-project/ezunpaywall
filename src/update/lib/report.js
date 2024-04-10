const path = require('path');
const fs = require('fs-extra');
const { format } = require('date-fns');
const { paths } = require('config');
const logger = require('./logger');

/**
 * Create report on the folder as name the date of process.
 *
 * @param {Object} state - State of process.
 *
 * @returns {Promise<void>}
 */
async function createReport(state) {
  const { type } = state;
  logger.info(`[report]: create new report for [${type}]`);
  const filepath = path.resolve(paths.data.reportsDir, `${format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")}_${type}.json`);
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
async function getReport(filename) {
  let report;
  const pathfile = path.resolve(paths.data.reportsDir, filename);
  try {
    report = await fs.readFile(pathfile);
  } catch (err) {
    logger.error(`[report] Cannot read [${pathfile}]`, err);
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
