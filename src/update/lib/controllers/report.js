const path = require('path');
const fs = require('fs-extra');
const { format } = require('date-fns');
const logger = require('../logger');

const reportsDir = path.resolve(__dirname, '..', '..', 'data', 'reports');

/**
 * create report on the folder "data/update/report" on behalf of the date of treatment
 * @param {String}  - state filename
 */
const createReport = async (state) => {
  const pathfile = path.resolve(reportsDir, `${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}.json`);
  try {
    await fs.writeFile(pathfile, JSON.stringify(state, null, 2));
  } catch (err) {
    logger.error(`Cannot write ${JSON.stringify(state, null, 2)} in ${pathfile}`);
    logger.error(err);
  }
};

/**-
 * get report from the folder "data/update/report"
 * @param {String} filename - report filename
 * @returns {Object} report
 */
const getReport = async (filename) => {
  let report;
  try {
    report = await fs.readFile(path.resolve(reportsDir, filename));
  } catch (err) {
    logger.error(`Cannot read ${path.resolve(reportsDir, filename)}`);
    logger.error(err);
    return undefined;
  }
  try {
    report = JSON.parse(report);
  } catch (err) {
    logger.error(`Cannot parse "${report}" at json format`);
    logger.error(err);
    return undefined;
  }
  return report;
};

module.exports = {
  createReport,
  getReport,
};
