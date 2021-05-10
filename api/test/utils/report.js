const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost:8080';
const { logger } = require('../../lib/logger');

const getReport = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/update/report');
  } catch (err) {
    logger.error(`getReport: ${err}`);
  }
  console.log(2)
  return res?.body?.report;
};

module.exports = {
  getReport,
};
