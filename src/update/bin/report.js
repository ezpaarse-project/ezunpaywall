const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../lib/logger');

const reportsDir = path.resolve(__dirname, '..', 'out', 'reports');

const {
  getState,
} = require('./state');

/**
 * create report on the folder "out/update/report" on behalf of the date of treatment
 * @param {string} stateName - state filename
 */
const createReport = async (stateName) => {
  const state = await getState(stateName);
  const pathfile = path.resolve(reportsDir, `${new Date().toISOString().slice(0, 10)}.json`);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createReport: ${err}`);
  }
};

/**-
 * get report from the folder "out/update/report"
 * @param {string} filename - report filename
 * @returns {object} report
 */
const getReport = async (filename) => {
  let state;
  try {
    state = await fs.readFile(path.resolve(reportsDir, filename));
  } catch (err) {
    logger.error(`getReport on fs.readFile: ${err}`);
    return undefined;
  }
  try {
    state = JSON.parse(state);
  } catch (err) {
    logger.error(`getReport on JSON.parse: ${err}`);
    return undefined;
  }
  return state;
};

module.exports = {
  createReport,
  getReport,
};
