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
const doi1 = '10.1186/s40510-015-0109-6'; // ligne 1 of fake1.jsonl
const doi2 = '10.14393/ufu.di.2018.728'; // line 35 of fake1.jsonl

describe('test graphqlRequest POST', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
  });

  describe('POST: get unpaywall data with one DOI', () => {
    it(`should get unpaywall data - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}} - variables : { dois: [${doi1}] }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: [doi1],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;

      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it('It should get empty tab - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}} - variable : { dois: [\'Coin coin\'] }', async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: ['Coin coin'],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.an('array');
      expect(data).eql([]);
    });
  });

  describe('POST: get unpaywall data with one DOI nor normalized', () => {
    it(`should get unpaywall data - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}} - variables : { dois : ['${doi1.toUpperCase()}'] }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: [doi1.toUpperCase()],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
    });
  });

  describe('POST: get unpaywall data with two DOI', () => {
    it(`should get unpaywall data - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}} - variables : { dois : ${[doi1, doi2]} }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: [doi1, doi2],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[1]).have.property('is_oa').eq(false);
    });

    it(`should get unpaywall data - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}} - variables : { dois : ${[doi1, 'Coin coin']} }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: [doi1, 'Coin Coin'],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('is_oa').eq(true);
    });

    it(`It should get empty tab - query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}  - variables : { dois : ${['Coin coin', 'Coin coin2']} }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]!) {GetByDOI(dois: $dois) {doi, is_oa}}' })
        .send({
          variables: {
            dois: ['Coin Coin', 'Coin Coin2'],
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('POST: get unpaywall data with one DOI and year', () => {
    it(`should get unpaywall data - query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year: 2015 }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year: '2015',
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`should get unpaywall data - query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}} - variables : { dois : ${[doi1, doi2]}, year: 2015 }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1, doi2],
            year: '2015',
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year: 2016 }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year: [String!]) {GetByDOI(dois: $dois, year: $year) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year: '2016',
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('POST: get unpaywall data with one DOI and range_year', () => {
    it(`should get unpaywall data - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { gte: 2015 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              gte: '2015',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { gte: 2016 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              gte: '2016',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });

    it(`should get unpaywall data - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { lte: 2016 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              lte: '2016',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`should get unpaywall data - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { lte: 2015 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              lte: '2015',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { lte: 2014 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              lte: '2014',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });

    it(`should get unpaywall data - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { gte: 2016, lte: 2014 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              gte: '2014',
              lte: '2016',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('year').eq('2015');
    });

    it(`It should get empty tab - query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}} - variables : { dois : ${[doi1]}, year_range: { gte: 2016, lte: 2018 } }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $year_range: year_range) {GetByDOI(dois: $dois, year_range: $year_range) {doi, is_oa, year}}' })
        .send({
          variables: {
            dois: [doi1],
            year_range: {
              gte: '2016',
              lte: '2018',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array').eql([]);
    });
  });

  describe('POST: get unpaywall data with one DOI and best_oa_location:{licence}', () => {
    it(`should get unpaywall data - query ($dois: [ID!]! $best_oa_location: oaLocationInput) {GetByDOI(dois: $dois, best_oa_location: $best_oa_location) {doi, is_oa, best_oa_location { license }}} - variables : { dois : ${[doi1]}, best_oa_location: { license: 'cc-by' }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $best_oa_location: oaLocationInput) {GetByDOI(dois: $dois, best_oa_location: $best_oa_location) {doi, is_oa, best_oa_location { license }}}' })
        .send({
          variables: {
            dois: [doi1],
            best_oa_location: {
              license: 'cc-by',
            },
          },
        })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);

      const data = res?.body?.data?.GetByDOI;
      expect(data).be.a('array');
      expect(data[0]).have.property('doi').eq(doi1);
      expect(data[0]).have.property('is_oa').eq(true);
      expect(data[0]).have.property('best_oa_location').have.property('license').eq('cc-by');
    });

    it(`It should get empty tab - query ($dois: [ID!]! $best_oa_location: oaLocationInput) {GetByDOI(dois: $dois, best_oa_location: $best_oa_location) {doi, is_oa, best_oa_location { license }}} - variables : { dois : ${[doi1]}, best_oa_location: { license: 'Coin coin' }`, async () => {
      const res = await chai.request(graphqlURL)
        .post('/graphql')
        .send({ query: 'query ($dois: [ID!]! $best_oa_location: oaLocationInput) {GetByDOI(dois: $dois, best_oa_location: $best_oa_location) {doi, is_oa, best_oa_location { license }}}' })
        .send({
          variables: {
            dois: [doi1],
            best_oa_location: {
              license: 'coin coin',
            },
          },
        })
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
