/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyHost = process.env.APIKEY_HOST || 'http://localhost:59704';

/**
 * ping apikey service to see if they are available
 */
async function ping() {
  const apikey = await chai.request(apikeyHost).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  const redis = await chai.request(apikeyHost).get('/ping/redis');
  if (!redis?.status) {
    throw new Error(`[redis] Bad status : ${redis?.status}`);
  }
}

module.exports = ping;
