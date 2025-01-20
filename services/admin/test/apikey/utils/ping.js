/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * ping admin API to see if they are available
 *
 * @returns {Promise<void>}
 */
async function ping() {
  const apikey = await chai.request(adminURL).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  const redis = await chai.request(adminURL).get('/ping/redis');
  if (!redis?.status) {
    throw new Error(`[redis]: Bad status : ${redis?.status}`);
  }
}

module.exports = ping;
