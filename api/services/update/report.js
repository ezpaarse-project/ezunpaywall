const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../../lib/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'report');

const {
  getState,
} = require('./state');

/**
 * create report on the folder "out/update/report" on behalf of the date of treatment
 * @param {String} stateName - state filename
 */
const createReport = async (stateName) => {
  const state = await getState(stateName);
  const pathfile = path.resolve(reportDir, `${new Date().toISOString().slice(0, 10)}.json`);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createReport: ${err}`);
  }
};

/**
 * get report from the folder "out/update/report"
 * @param {String} filename - report filename
 * @returns {Object} report
 */
const getReport = async (filename) => {
  let state = await fs.readFile(path.resolve(reportDir, filename));
  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`getReport on JSON.parse: ${err}`);
  }
  return state;
};

module.exports = {
  createReport,
  getReport,
};
