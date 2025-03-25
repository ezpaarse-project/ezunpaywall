const request = require('supertest');

const startServer = require('../../src/app');
const { loadApikey } = require('../utils/apikey');
const { deleteIndex } = require('../utils/elastic');

describe('Graphql: GET GetByDOI resolver', () => {
  let app;
  const apikey1 = 'apikey1';

  beforeAll(async () => {
    app = await startServer();
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });

  describe('Graphql: GET metrics resolver', () => {
    it('Should get metrics - { metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: '{ metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
      const metrics = response?.body?.data?.metrics;
      expect(metrics).toMatchObject({
        doi: 5,
        isOA: 4,
        goldOA: 1,
        hybridOA: 1,
        bronzeOA: 1,
        greenOA: 1,
        closedOA: 1,
      });
    });
  });

  describe('Graphql: GET metrics resolver with no index', () => {
    beforeAll(async () => {
      await deleteIndex('unpaywall');
    });
    it('Should get metrics - { metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }', async () => {
      const response = await request(app)
        .get('/graphql')
        .query({ query: '{ metrics { doi, isOA, goldOA, hybridOA, bronzeOA, greenOA, closedOA } }' })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
      const metrics = response?.body?.data?.metrics;
      expect(metrics).toMatchObject({
        doi: 0,
        isOA: 0,
        goldOA: 0,
        hybridOA: 0,
        bronzeOA: 0,
        greenOA: 0,
        closedOA: 0,
      });
    });
  });
});
