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

const graphqlURL = process.env.GRAPHQL_HOST || 'http://localhost:59701';
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

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
