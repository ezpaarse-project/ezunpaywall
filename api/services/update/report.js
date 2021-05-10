const path = require('path');
const fs = require('fs-extra');
const { logger } = require('../../lib/logger');

const reportDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'report');
const stateDir = path.resolve(__dirname, '..', '..', 'out', 'update', 'state');

const {
  getState
} = require('./state')

/**
 * @param {*} fileName - state file name
 */
const createReport = async (stateName) => {
  let state = await getState(stateName)
  const pathfile = path.resolve(reportDir, `${new Date().toISOString().slice(0, 10)}.json`);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`createReport: ${err}`);
  }
};

/**
 * @param {*} fileName - report file name
 * @returns {Object} report
 */
const getReport = async (fileName) => {
  let state = await fs.readFile(path.resolve(reportDir, fileName));
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
}