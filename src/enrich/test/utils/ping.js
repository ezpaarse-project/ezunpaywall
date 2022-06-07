/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const enrichURL = process.env.ENRICH_URL || 'http://localhost:3000';

/**
 * ping all services to see if they are available
 */

async function pingEnrich() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(enrichURL).get('/ping');
    } catch (err) {
      console.error(`enrich ping : ${err}`);
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
      res = await chai.request(enrichURL).get('/ping/elastic');
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
      res = await chai.request(enrichURL).get('/ping/redis');
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
  pingEnrich,
  pingElastic,
  pingRedis,
};
