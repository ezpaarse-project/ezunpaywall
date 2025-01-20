/* eslint-disable no-await-in-loop */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const graphqlHost = process.env.GRAPHQL_URL || 'http://localhost:59701';
const elasticHost = process.env.UPDATE_HOST || 'http://elastic:changeme@localhost:9200';
const adminURL = process.env.ADMIN_HOST || 'http://localhost:59703';

/**
 * ping all services to see if they are available
 */
async function ping() {
  const graphql = await chai.request(graphqlHost).get('/ping');
  if (graphql?.status !== 204) {
    throw new Error(`[graphql]: Bad status : ${graphql?.status}`);
  }

  const elastic = await chai.request(elasticHost).get('/');
  if (elastic?.status !== 200) {
    throw new Error(`[elastic]: Bad status : ${elastic?.status}`);
  }

  const admin = await chai.request(adminURL).get('/ping');
  if (admin?.statusCode !== 204) {
    throw new Error(`[admin]: Bad status : ${admin?.status}`);
  }
}

module.exports = ping;
