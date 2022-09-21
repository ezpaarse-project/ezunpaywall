/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyURL = process.env.APIKEY_HOST || 'http://localhost:59704';

/**
 * ping apikey service to see if they are available
 */
const ping = async () => {
  let apikey;
  while (apikey?.status !== 200) {
    try {
      apikey = await chai.request(apikeyURL).get('/ping');
    } catch (err) {
      console.error(`apikey ping : ${err}`);
    }
    if (apikey?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  let redis;
  do {
    try {
      redis = await chai.request(apikeyURL).get('/ping/redis');
    } catch (err) {
      console.error(`redis ping : ${err}`);
    }
    if (!redis?.status) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (!redis?.status);
};

module.exports = ping;
