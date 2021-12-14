/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

const { elasticClient } = require('./elastic');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';
const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:12000';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  // update
  let res1;
  do {
    try {
      res1 = await chai.request(updateURL).get('/');
    } catch (err) {
      console.error(`update ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (res1?.status !== 200);

  // fakeUnpaywall
  let res2;
  do {
    try {
      res2 = await chai.request(fakeUnpaywallURL).get('/');
    } catch (err) {
      console.error(`fakeUnpaywall ping : ${err}`);
    }
    if (res2?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (res2?.status !== 200);

  // elastic
  let res3;
  do {
    try {
      res3 = await elasticClient.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res3?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (res3?.statusCode !== 200);

  // auth
  let res4;
  do {
    try {
      res4 = await chai.request(apikeyURL).get('/');
    } catch (err) {
      console.error(`auth ping : ${err}`);
    }
    if (res4?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (res4?.statusCode !== 200);

  // redis
  let res5;
  do {
    try {
      res5 = await chai.request(apikeyURL).get('/');
    } catch (err) {
      console.error(`redis ping : ${err}`);
    }
    if (res5?.body.redis !== 'Alive') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (res5?.body.redis !== 'Alive');
};

module.exports = {
  ping,
};
