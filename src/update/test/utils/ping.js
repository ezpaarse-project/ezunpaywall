/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_HOST || 'http://localhost:4000';
const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:12000';

/**
 * ping all services to see if they are available
 */
const ping = async () => {
  let update;
  do {
    try {
      update = await chai.request(updateURL).get('/ping');
    } catch (err) {
      console.error(`update ping : ${err}`);
    }
    if (update?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (update?.status !== 200);

  let fakeUnpaywall;
  do {
    try {
      fakeUnpaywall = await chai.request(fakeUnpaywallURL).get('/ping');
    } catch (err) {
      console.error(`fakeUnpaywall ping : ${err}`);
    }
    if (fakeUnpaywall?.status !== 200) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (fakeUnpaywall?.status !== 200);

  let elastic;
  while (elastic?.status !== 200) {
    try {
      elastic = await chai.request(updateURL).get('/ping/elastic');
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
      redis = await chai.request(updateURL).get('/ping/redis');
    } catch (err) {
      console.error(`redis ping : ${err}`);
    }
    if (!redis?.status) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } while (!redis?.status);
};

module.exports = ping;
