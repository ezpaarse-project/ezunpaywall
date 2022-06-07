/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const graphqlURL = process.env.GRAPHQL_URL || 'http://localhost:3000';

async function pingElastic() {
  let res;
  let i = 1;
  for (i; i < 3; i += 1) {
    try {
      res = await chai.request(graphqlURL).get('/ping/elastic');
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
      res = await chai.request(graphqlURL).get('/ping/redis');
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
  pingElastic,
  pingRedis,
};
