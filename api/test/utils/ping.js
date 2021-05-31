/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const client = require('../../lib/client');
const { logger } = require('../../lib/logger');

chai.use(chaiHttp);

require('../../app');
require('../../../fakeUnpaywall/app');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL;

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  // api ezunpaywall
  let res1;
  while (res1?.status !== 200 && res1?.body?.data !== 'pong') {
    try {
      res1 = await chai.request(ezunpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`ezunpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait fakeUnpaywall
  let res2;
  while (res2?.body?.data !== 'pong') {
    try {
      res2 = await chai.request(fakeUnpaywallURL).get('/ping');
    } catch (err) {
      logger.error(`fakeUnpaywall ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve(), 1000));
  }
  // wait elastic started
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      logger.error(`elastic ping : ${err}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

module.exports = {
  ping,
};
