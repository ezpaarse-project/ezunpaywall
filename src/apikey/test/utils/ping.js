/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

/**
 * ping auth service to see if they are available
 */
const ping = async () => {
  let res1;
  while (res1?.status !== 200) {
    try {
      res1 = await chai.request(apikeyURL).get('/');
    } catch (err) {
      console.error(`auth ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('auth ping : OK');
};

module.exports = ping;
