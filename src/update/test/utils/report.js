const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

// TODO put it in config
const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';

/**
 * get report of update
 * @returns {JSON} report
 */
const getReport = async () => {
  let res;
  try {
    res = await chai.request(updateURL)
      .get('/report')
      .query({ latest: true });
  } catch (err) {
    console.error(`Cannot GET ${updateURL}/report`);
    process.exit(1);
  }
  return res?.body;
};

module.exports = {
  getReport,
};
