/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const updateHost = process.env.UPDATE_HOST || 'http://localhost:59702';
const elasticHost = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';
const apikeyHost = process.env.APIKEY_HOST || 'http://localhost:59704';
const fakeUnpaywallHost = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:59799';

/**
 * ping all services to see if they are available
 */
async function ping() {
  const update = await chai.request(updateHost).get('/ping');
  if (update?.status !== 204) {
    throw new Error(`[update] Bad status : ${update?.status}`);
  }

  const fakeUnpaywall = await chai.request(fakeUnpaywallHost).get('/ping');
  if (fakeUnpaywall?.status !== 204) {
    throw new Error(`[fakeUnpaywall] Bad status : ${fakeUnpaywall?.status}`);
  }

  const elastic = await chai.request(elasticHost).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic] Bad status : ${elastic?.status}`);
  }

  const apikey = await chai.request(apikeyHost).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  return false;
}

module.exports = ping;
