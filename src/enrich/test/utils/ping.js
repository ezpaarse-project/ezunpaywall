/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const enrichHost = process.env.ENRICH_HOST || 'http://localhost:59703';
const elasticHost = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';
const apikeyHost = process.env.APIKEY_HOST || 'http://localhost:59704';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  const enrich = await chai.request(enrichHost).get('/ping');
  if (enrich?.status !== 204) {
    throw new Error(`[enrich] Bad status : ${enrich?.status}`);
  }

  const elastic = await chai.request(elasticHost).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic] Bad status : ${elastic?.status}`);
  }

  const apikey = await chai.request(apikeyHost).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  const redis = await chai.request(enrichHost).get('/ping/redis');
  if (!redis?.status) {
    throw new Error(`[redis] Bad status : ${redis?.status}`);
  }
};

module.exports = ping;
