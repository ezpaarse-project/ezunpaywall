const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const unpaywallBaseMapping = require('./mapping/unpaywall.json');
const unpaywallHistoryMapping = require('./mapping/unpaywall.json');

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

const date1 = '2019-06-01';
const date2 = '2020-01-02';
const date3 = '2010-10-01';

describe('Test POST 2 unpaywallHistory resolver', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall_base');
    await createIndex('unpaywall_base', unpaywallBaseMapping);
    await deleteIndex('unpaywall_history');
    await createIndex('unpaywall_history', unpaywallHistoryMapping);
    await insertDataUnpaywall('indexBaseData.jsonl', 'unpaywall_base');
    await insertDataUnpaywall('indexHistoryData.jsonl', 'unpaywall_history');
  });

  describe('Test: Try to get a unpaywall data', () => {
    it('Should get unpaywall data from unpaywall_base and unpaywall_history index', async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: `{ unpaywallHistory (dois: ["${doi1}"]) { doi, is_oa, updated, endValidity, referencedAt } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.unpaywallHistory;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('updated').eq('2020-01-01T01:00:00.000000');
      expect(data[0]).have.property('endValidity').eq(null);
      expect(data[1]).have.property('doi').eq(doi1);
      expect(data[1]).have.property('is_oa').eq(false);
      expect(data[1]).have.property('updated').eq('2019-01-01T01:00:00.000000');
      expect(data[1]).have.property('endValidity').eq('2020-01-01T01:00:00.000000');
    });
  });

  describe(`Test: Try to get a unpaywall data at date [${date1}]`, () => {
    it('Should get unpaywall data from unpaywall_history index', async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: `{ unpaywallHistory (dois: ["${doi1}"], date: "${date1}") { doi, is_oa, updated, endValidity, referencedAt } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.unpaywallHistory;

      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(false);
      expect(data[0]).have.property('updated').eq('2019-01-01T01:00:00.000000');
      expect(data[0]).have.property('endValidity').eq('2020-01-01T01:00:00.000000');
    });
  });

  describe(`Test: Try to get a unpaywall data at date [${date2}]`, () => {
    it('Should get unpaywall data from unpaywall_base index', async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: `{ unpaywallHistory (dois: ["${doi1}"], date: "${date2}") { doi, is_oa, updated, endValidity, referencedAt } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.unpaywallHistory;

      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('updated').eq('2020-01-01T01:00:00.000000');
      expect(data[0]).have.property('endValidity').eq(null);
    });
  });

  describe(`Test: Try to get a unpaywall data at date [${date2}]`, () => {
    it('Should get empty array', async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: `{ unpaywallHistory (dois: ["${doi1}"], date: "${date3}") { doi, is_oa, updated, endValidity, referencedAt } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);

      const data = res?.body?.data?.unpaywallHistory;

      expect(data).be.a('array');
    });
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
