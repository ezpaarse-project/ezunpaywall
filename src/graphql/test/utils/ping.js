/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');
const { elasticClient } = require('./elastic');

chai.use(chaiHttp);

const graphqlURL = process.env.GRAPHQL_URL || 'http://localhost:3000';
const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  // graphql
  let res1;
  while (res1?.status !== 200) {
    try {
      res1 = await chai.request(graphqlURL).get('/');
    } catch (err) {
      console.error(`graphql ping : ${err}`);
    }
    if (res1?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log('graphql ping : OK');
    }
  }

  // wait elastic started
  let res2;
  while (res2?.statusCode !== 200) {
    try {
      res2 = await elasticClient.ping();
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res2?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log('elastic ping : OK');

  // auth
  let res3;
  do {
    try {
      res3 = await chai.request(apikeyURL).get('/');
    } catch (err) {
      console.error(`auth ping : ${err}`);
    }
    if (res3?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log('auth ping : OK');
    }
  } while (res3?.statusCode !== 200);

  // redis
  let res4;
  do {
    try {
      res4 = await chai.request(apikeyURL).get('/');
    } catch (err) {
      console.error(`redis ping : ${err}`);
    }
    if (!res4?.body.redis) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } else {
      console.log('redis ping : OK');
    }
  } while (!res4?.body.redis);
};

module.exports = {
  ping,
};
