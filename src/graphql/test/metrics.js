const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const mappingUnpaywall = require('./mapping/unpaywall.json');

const {
  createIndex,
  deleteIndex,
  insertDataUnpaywall,
} = require('./utils/elastic');

const ping = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const graphqlURL = process.env.GRAPHQL_HOST || 'http://localhost:3000';

describe('test graphql metrics request', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
  });

  describe('GET: get metrics', () => {
    it('Should get metrics - { Metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ Metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      const metrics = res?.body?.data?.Metrics;
      expect(metrics).have.property('doi').eq(50);
      expect(metrics).have.property('isOA').eq(43);
      expect(metrics).have.property('goldOA').eq(17);
      expect(metrics).have.property('hybridOA').eq(1);
      expect(metrics).have.property('bronzeOA').eq(13);
      expect(metrics).have.property('greenOA').eq(12);
      expect(metrics).have.property('closedOA').eq(7);
    });
  });

  describe('GET: get metrics', () => {
    before(async () => {
      await deleteIndex('unpaywall-test');
      await createIndex('unpaywall-test', mappingUnpaywall);
    });

    it('Should get metrics - { Metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ Metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      const metrics = res?.body?.data?.Metrics;
      expect(metrics).have.property('doi').eq(0);
      expect(metrics).have.property('isOA').eq(0);
      expect(metrics).have.property('goldOA').eq(0);
      expect(metrics).have.property('hybridOA').eq(0);
      expect(metrics).have.property('bronzeOA').eq(0);
      expect(metrics).have.property('greenOA').eq(0);
      expect(metrics).have.property('closedOA').eq(0);
    });
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
