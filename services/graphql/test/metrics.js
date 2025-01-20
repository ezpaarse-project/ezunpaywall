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

const graphqlURL = process.env.GRAPHQL_URL || 'http://localhost:59701';

describe('Test GET metrics resolver', () => {
  before(async function () {
    this.timeout(30000);
    await deleteAllAPIKey();
    await ping();
    await loadDevAPIKey();
    await deleteIndex('unpaywall');
    await createIndex('unpaywall', mappingUnpaywall);
    await insertDataUnpaywall('indexBaseData.jsonl', 'unpaywall');
  });

  describe('GET: get metrics', () => {
    it('Should get metrics - { metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', 'user');

      expect(res).have.status(200);
      const metrics = res?.body?.data?.metrics;
      expect(metrics).have.property('doi').eq(10);
      expect(metrics).have.property('isOA').eq(5);
      expect(metrics).have.property('goldOA').eq(1);
      expect(metrics).have.property('hybridOA').eq(1);
      expect(metrics).have.property('bronzeOA').eq(1);
      expect(metrics).have.property('greenOA').eq(2);
      expect(metrics).have.property('closedOA').eq(5);
    });
  });

  describe('GET: get metrics', () => {
    before(async () => {
      await deleteIndex('unpaywall');
      await createIndex('unpaywall', mappingUnpaywall);
    });

    it('Should get metrics - { metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', 'user');

      expect(res).have.status(200);
      const metrics = res?.body?.data?.metrics;
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
