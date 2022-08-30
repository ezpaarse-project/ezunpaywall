/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const graphqlURL = process.env.EZUNPAYWALL_GRAPHQL_URL || 'http://localhost:3000';
const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  let graphql;
  while (graphql?.status !== 200) {
    try {
      graphql = await chai.request(graphqlURL).get('/ping');
    } catch (err) {
      console.error(`graphql ping : ${err}`);
    }
    if (graphql?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  let elastic;
  while (elastic?.status !== 200) {
    try {
      elastic = await chai.request(graphqlURL).get('/ping/elastic');
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (elastic?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  let apikey;
  do {
    try {
      apikey = await chai.request(apikeyURL).get('/ping');
    } catch (err) {
      console.error(`apikey ping : ${err}`);
    }
    if (apikey?.statusCode !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (apikey?.statusCode !== 200);

  let redis;
  do {
    try {
      redis = await chai.request(graphqlURL).get('/ping/redis');
    } catch (err) {
      console.error(`redis ping : ${err}`);
    }
    if (!redis?.status) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (!redis?.status);
};

module.exports = ping;
