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
  ping,
} = require('./utils/ping');

chai.use(chaiHttp);

const graphqlURL = process.env.GRAPHQL_URL || 'http://localhost:3000';

const doi1 = '10.1186/s40510-015-0109-6'; // ligne 1 of fake1.jsonl

describe('Test: auth service in graphql service', () => {
  before(async function () {
    this.timeout(30000);
    await ping();
    await deleteIndex('unpaywall-test');
    await createIndex('unpaywall-test', mappingUnpaywall);
    await insertDataUnpaywall();
  });

  describe('Test with user API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'user')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
    });
  });

  describe('Test with graphql API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'graphql')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
    });
  });

  describe('Test with userRestricted API key', () => {
    it('Should do graphql request', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa, best_oa_location { license } } }` })
        .set('x-api-key', 'userRestricted')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
    });
  });

  describe('Test without user API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with wrong API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'wrong apikey')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with enrich API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'enrich')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with update API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'update')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with notAllowed API key', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', 'notAllowed')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('Not authorized');
    });
  });

  describe('Test with userRestricted API key but with not authorized unpaywall attributes', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa, oa_status } }` })
        .set('x-api-key', 'userRestricted')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('You don\'t have access to oa_status');
    });
  });

  describe('Test with userRestricted API key but with not authorized unpaywall attributes', () => {
    it('Should return a error message', async () => {
      const res = await chai.request(graphqlURL)
        .get('/graphql')
        .query({ query: `{ GetByDOI(dois:["${doi1}"]) { doi, is_oa, best_oa_location { license }, first_oa_location { license } } }` })
        .set('x-api-key', 'userRestricted')
        .set('index', 'unpaywall-test');

      expect(res).have.status(200);
      expect(res?.body.errors[0].message).eq('You don\'t have access to first_oa_location.license');
    });
  });
});
