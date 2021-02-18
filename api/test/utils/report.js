const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();
chai.use(chaiHttp);

const ezunpaywallURL = 'http://localhost:8080';
const { logger } = require('../../lib/logger');

const getLatestReport = async () => {
  let report;
  try {
    const response = await chai.request(ezunpaywallURL).get('/reports?latest=true');
    report = response?.body;
  } catch (err) {
    logger.error(`ezunpaywall ping : ${err}`);
  }
  return report;
};

module.exports = {
  getLatestReport,
};
