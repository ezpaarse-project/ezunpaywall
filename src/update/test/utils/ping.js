/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';
const fakeUnpaywallURL = process.env.FAKE_UNPAYWALL_URL || 'http://localhost:12000';

/**
 * ping all services to see if they are available
 */

async function pingUpdate() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(updateURL).get('/ping');
    } catch (err) {
      console.error(`update ping : ${err}`);
    }
    if (res.status === 200) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function pingFakeUnpaywall() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(fakeUnpaywallURL).get('/ping');
    } catch (err) {
      console.error(`fakeUnpaywall ping : ${err}`);
    }
    if (res.status === 200) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function pingElastic() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(updateURL).get('/ping/elastic');
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res.status === 200) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function pingRedis() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(updateURL).get('/ping/redis');
    } catch (err) {
      console.error(`elastic ping : ${err}`);
    }
    if (res.status === 200) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

module.exports = {
  pingUpdate,
  pingFakeUnpaywall,
  pingElastic,
  pingRedis,
};
