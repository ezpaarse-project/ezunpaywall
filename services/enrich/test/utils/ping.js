/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const enrichURL = process.env.ENRICH_URL || 'http://localhost:59702';
const elasticURL = process.env.ELASITC_URL || 'http://elastic:changeme@localhost:9200';
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * ping all services to see if they are available
 */
async function ping() {
  const enrich = await chai.request(enrichURL).get('/ping');
  if (enrich?.status !== 204) {
    throw new Error(`[enrich] Bad status : ${enrich?.status}`);
  }

  const elastic = await chai.request(elasticURL).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic] Bad status : ${elastic?.status}`);
  }

  const apikey = await chai.request(adminURL).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }
}

module.exports = ping;
