const { expect } = require('chai');
const chai = require('chai');
const chaiHttp = require('chai-http');

const mappingUnpaywall = require('./mapping/unpaywall.json');

const {
  createIndex,
  deleteIndex,
  insertDataUnpaywall,
} = require('./utils/elastic');

const {
  pingElastic,
  pingRedis,
} = require('./utils/ping');

const {
  loadDevAPIKey,
  deleteAllAPIKey,
} = require('./utils/apikey');

chai.use(chaiHttp);

const graphqlURL = process.env.GRAPHQL_URL || 'http://localhost:3000';
const doi1 = '10.1186/s40510-015-0109-6'; // ligne 1 of fake1.jsonl
const doi2 = '10.14393/ufu.di.2018.728'; // line 35 of fake1.jsonl

describe('test graphqlRequest', () => {
  before(async function () {
    this.timeout(30000);
    await pingElastic();
    await pingRedis();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
  });

  describe('GET: get unpaywall data with one DOI', () => {
    it(`Should get unpaywall data - {GetByDOI(dois:["${doi1}"]){doi, is_oa}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"]){doi, is_oa}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it('It should get empty tab - {GetByDOI(dois:["Coin Coin"]){doi, is_oa}}', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{GetByDOI(dois:["Coin Coin"]){doi, is_oa}}' })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.an('array');
      expect(data).eql([]);
    });
  });

  describe('GET: get unpaywall data with one DOI nor normalized', () => {
    it(`Ghould get unpaywall data - {GetByDOI(dois:["${doi1.toUpperCase()}"]){doi, is_oa}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1.toUpperCase()}"]){doi, is_oa}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });
  });

  describe('GET: get unpaywall data with two DOI', () => {
    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}","${doi2}"]){doi, is_oa}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}","${doi2}"]){doi, is_oa}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[1]).have.property('is_oa').eq(false);
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}","Coin Coin"]){doi, is_oa}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}","Coin Coin"]){doi, is_oa}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it('It should get empty tab - {GetByDOI(dois:["Coin Coin","Coin Coin2"]){doi, is_oa}}', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: '{GetByDOI(dois:["Coin Coin","Coin Coin2"]){doi, is_oa}}' })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('GET: get unpaywall data with one DOI and year', () => {
    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year:"2015"){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year:"2015"){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}","${doi2}"], year:"2015"){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}","${doi2}"], year:"2015"){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - {GetByDOI(dois:["${doi1}"], year:"2016"){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year:"2016"){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('GET: get unpaywall data with one DOI and range_year', () => {
    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year_range:{gte:"2014"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{gte:"2014"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year_range:{gte:"2015"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{gte:"2015"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - {GetByDOI(dois:["${doi1}"], year_range:{gte:"2016"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{gte:"2016"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year_range:{lte:"2016"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{lte:"2016"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year_range:{lte:"2015"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{lte:"2015"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - {GetByDOI(dois:["${doi1}"], year_range:{lte:"2014"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{lte:"2014"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });

    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], year_range:{gte:"2014" lte:"2016"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{gte:"2014" lte:"2016"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - {GetByDOI(dois:["${doi1}"], year_range:{gte:"2016", lte:"2018"}){doi, is_oa, year}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], year_range:{gte:"2016", lte:"2018"}){doi, is_oa, year}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('GET: get unpaywall data with one DOI and best_oa_location:{licence}', () => {
    it(`should get unpaywall data - {GetByDOI(dois:["${doi1}"], best_oa_location:{license: "cc-by"}){doi, is_oa, best_oa_location {license}}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], best_oa_location:{license: "cc-by"}){doi, is_oa, best_oa_location {license}}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');
      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('best_oa_location').have.property('license').eq('cc-by');
    });

    it(`It should get empty tab - {GetByDOI(dois:["${doi1}"], best_oa_location:{license: "coin coin"}){doi, is_oa, best_oa_location {license}}}`, async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{GetByDOI(dois:["${doi1}"], best_oa_location:{license: "coin coin"}){doi, is_oa, best_oa_location {license}}}` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

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
