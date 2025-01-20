/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const elasticURL = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:59799';

/**
 * ping all services to see if they are available
 *
 * @returns {Promise<void>}
 */
async function ping() {
  const fakeUnpaywall = await chai.request(fakeUnpaywallURL).get('/ping');
  if (fakeUnpaywall?.status !== 204) {
    throw new Error(`[fakeUnpaywall] Bad status : ${fakeUnpaywall?.status}`);
  }

  const elastic = await chai.request(elasticURL).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic]: Bad status : ${elastic?.status}`);
  }

  const apikey = await chai.request(adminURL).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  return false;
}

module.exports = ping;
