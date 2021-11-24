/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { client } = require('./elastic');

chai.use(chaiHttp);

const enrichURL = process.env.ENRICH_URL || 'http://localhost:3000';
const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

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
    } else {
      console.log('enrich ping : OK');
    }
  }

  // elastic
  let res3;
  while (res3?.statusCode !== 200) {
    try {
      res3 = await client.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res3?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log('elastic ping : OK');
    }
  }

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
    } else {
      console.log('auth ping : OK');
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
    } else {
      console.log('redis ping : OK');
    }
  } while (res5?.body.redis !== 'Alive');
};

module.exports = {
  ping,
};
