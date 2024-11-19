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

describe('Test: auth service in graphql service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteAllAPIKey();
    await loadDevAPIKey();
    await deleteIndex('unpaywall');
    await createIndex('unpaywall', mappingUnpaywall);
    await insertDataUnpaywall('indexBaseData.jsonl', 'unpaywall');
  });

  describe('Test with user API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'user');

      expect(res).have.status(200);
    });
  });

  describe('Test with graphql API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'graphql');

      expect(res).have.status(200);
    });
  });

  describe('Test with restrictedUser API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa, best_oa_location { license } } }` })
        .set('x-api-key', 'restrictedUser');

      expect(res).have.status(200);
    });
  });

  describe('Test without user API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` });

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with wrong API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'wrong apikey');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with enrich API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'enrich');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with admin API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'update');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with notAllowed API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'notAllowed');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with restrictedUser API key but with not authorized unpaywall attributes', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa, oa_status } }` })
        .set('x-api-key', 'restrictedUser');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('You don\'t have access to oa_status');
    });
  });

  describe('Test with restrictedUser API key but with not authorized unpaywall attributes', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa, best_oa_location { license }, first_oa_location { license } } }` })
        .set('x-api-key', 'restrictedUser');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('You don\'t have access to first_oa_location.license');
    });
  });

  after(async () => {
    await deleteAllAPIKey();
    await loadDevAPIKey();
  });
});
