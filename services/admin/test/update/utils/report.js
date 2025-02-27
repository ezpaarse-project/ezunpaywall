const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * get report of update
 *
 * @returns {Promise{Object}} report
 */
async function getReport(type) {
  let res;
  try {
    res = await chai.request(adminURL)
      .get(`/reports?type=${type}`)
      .query({ latest: true });
  } catch (err) {
    process.exit(1);
  }
  return res?.body;
}

module.exports = getReport;
