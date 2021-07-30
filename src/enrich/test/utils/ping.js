/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { client } = require('./elastic');

chai.use(chaiHttp);

const enrichURL = process.env.ENRICH_URL || 'http://localhost:3000';
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:12000';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  // enrich
  let res1;
  while (res1?.status !== 200) {
    try {
      res1 = await chai.request(enrichURL).get('/');
    } catch (err) {
      console.error(`enrich ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('enrich ping : OK');
  // wait fakeUnpaywall
  let res2;
  while (res2?.status !== 200) {
    try {
      res2 = await chai.request(fakeUnpaywallURL).get('/');
    } catch (err) {
      console.error(`fakeUnpaywall ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('fakeUnpaywall ping : OK');
  // wait elastic started
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('elastic ping : OK');
};

module.exports = {
  ping,
};
