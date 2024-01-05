const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

/**
 * get report of update
 *
 * @returns {Promise{Object}} report
 */
async function getReport() {
  let res;
  try {
    res = await chai.request(updateURL)
      .get('/reports')
      .query({ latest: true });
  } catch (err) {
    console.error(`Cannot GET ${updateURL}/report`);
    process.exit(1);
  }
  return res?.body;
}

/**
 * get report of update
 *
 * @returns {Promise{Object}} report
 */
async function getHistoryReport() {
  let res;
  try {
    res = await chai.request(updateURL)
      .get('/unpaywall/history/reports')
      .query({ latest: true });
  } catch (err) {
    console.error(`Cannot GET ${updateURL}/report`);
    process.exit(1);
  }
  return res?.body;
}

module.exports = {
  getReport,
  getHistoryReport,
};
