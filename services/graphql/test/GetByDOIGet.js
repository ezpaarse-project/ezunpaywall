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
const doi1 = '1';
const doi2 = '6';

describe('Test GET GetByDOI resolver', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall_base');
    await createIndex('unpaywall_base', mappingUnpaywall);
    await insertDataUnpaywall('indexBaseData.jsonl', 'unpaywall_base');
  });

  describe('GET: get unpaywall data with one DOI', () => {
    it(`Should get unpaywall data - { GetByDOI(dois: ["${doi1}"]) { doi, is_oa } }`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois: ["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it('It should get empty tab - { GetByDOI(dois: ["Coin Coin"]) { doi, is_oa } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ GetByDOI(dois: ["Coin Coin"]) { doi, is_oa } }' })
        .set('x-api-key', 'user');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.an('array');
      expect(data).eql([]);
    });
  });

  describe('GET: get unpaywall data with one DOI not normalized', () => {
    it(`Ghould get unpaywall data - { GetByDOI(dois: ["${doi1.toUpperCase()}"]) { doi, is_oa } }`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois: ["${doi1.toUpperCase()}"]) { doi, is_oa } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });
  });

  describe('GET: get unpaywall data with two DOI', () => {
    it(`should get unpaywall data - { GetByDOI(dois: ["${doi1}","${doi2}"]) { doi, is_oa } }`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois: ["${doi1}","${doi2}"]) { doi, is_oa } }` })
        .set('x-api-key', 'user');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[1]).have.property('is_oa').eq(false);
    });

    it(`should get unpaywall data - { GetByDOI(dois: ["${doi1}","Coin Coin"]) { doi, is_oa } }`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois: ["${doi1}","Coin Coin"]) { doi, is_oa } }` })
        .set('x-api-key', 'user');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it('It should get empty tab - { GetByDOI(dois: ["Coin Coin","Coin Coin2"]) { doi, is_oa } }', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{ GetByDOI(dois: ["Coin Coin","Coin Coin2"]) { doi, is_oa} }' })
        .set('x-api-key', 'user');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
