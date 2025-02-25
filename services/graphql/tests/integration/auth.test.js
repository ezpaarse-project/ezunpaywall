const request = require('supertest');

const startServer = require('../../src/app');
const { loadApikey } = require('../utils/apikey');

describe('Graphql: check auth', () => {
  let app;
  const apikey1 = 'apikey1';
  const apikey3 = 'apikey3';
  const apikey4 = 'apikey4';
  const doi1 = '1';

  beforeAll(async () => {
    app = await startServer();
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });
  describe('Test with user API key', () => {
    it('Should do graphql request with API Key', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Test without API key', () => {
    it('Should do graphql request and get Not authorized', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` });

      expect(response.statusCode).toBe(200);
      expect(response?.body.errors[0].message).toBe('Not authorized');
    });
  });

  describe('Test with restricted API key', () => {
    it('Should do graphql request and get Not authorized', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', apikey3);

      expect(response.statusCode).toBe(200);
      expect(response?.body.errors[0].message).toBe('Not authorized');
    });
  });

  describe('Test with API key without access', () => {
    it('Should do graphql request and get Not authorized', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: `{ unpaywall(dois:["${doi1}"]) { doi, is_oa } }` })
        .set('x-api-key', apikey4);

      expect(response.statusCode).toBe(200);
      expect(response?.body.errors[0].message).toBe('Not authorized');
    });
  });
});
