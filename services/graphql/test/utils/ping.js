/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const graphqlHost = process.env.GRAPHQL_HOST || 'http://localhost:59701';
const updateHost = process.env.UPDATE_HOST || 'http://localhost:59702';
const elasticHost = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';
const apikeyHost = process.env.APIKEY_HOST || 'http://localhost:59704';

/**
 * ping all services to see if they are available
 */
async function ping() {
  const graphql = await chai.request(graphqlHost).get('/ping');
  if (graphql?.status !== 204) {
    throw new Error(`[graphql] Bad status : ${graphql?.status}`);
  }

  const elastic = await chai.request(elasticHost).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic]: Bad status : ${elastic?.status}`);
  }

  const apikey = await chai.request(apikeyHost).get('/ping');
  if (apikey?.statusCode !== 204) {
    throw new Error(`[apikey] Bad status : ${apikey?.status}`);
  }

  const redis = await chai.request(updateHost).get('/ping/redis');
  if (!redis?.status) {
    throw new Error(`[redis] Bad status : ${redis?.status}`);
  }
}

module.exports = ping;
