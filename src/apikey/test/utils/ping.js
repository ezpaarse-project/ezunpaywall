/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_URL || 'http://localhost:7000';

/**
 * ping apikey service to see if they are available
 */
async function pingApikey() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(apikeyURL).get('/ping');
    } catch (err) {
      console.error(`enrich ping : ${err}`);
    }
    if (res.status === 200) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

module.exports = pingApikey;
