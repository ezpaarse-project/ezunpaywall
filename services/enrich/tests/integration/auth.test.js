const path = require('path');
const request = require('supertest');
const { setTimeout } = require('timers/promises');

const app = require('../../src/app');

const { loadApikey } = require('../utils/apikey');

const enrichDir = path.resolve(__dirname, '..', 'utils', 'sources');

describe('Enrich: check auth', () => {
  const apikey1 = 'apikey1';
  const apikey2 = 'apikey2';
  const apikey3 = 'apikey3';
  const apikey4 = 'apikey4';

  beforeAll(async () => {
    await setTimeout(10);
    await loadApikey();
  });

  afterAll(async () => {
    app.close();
  });

  describe('Test with API key with all permissions', () => {
    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);
      expect(response.body).toBeDefined();
    });
  });

  describe('Test with API key without access to enrich', () => {
    it('Should return http status 401', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey2);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Test without API key', () => {
    it('Should return http status 401', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Test with API key that not exists', () => {
    it('Should return http status 401', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', 'coin');

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Test with API key not allowed', () => {
    it('Should return http status 401', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey3);

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Test with API key without access to all args', () => {
    let id;
    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey4);

      expect(response.statusCode).toBe(200);
      id = response.body;
    });

    it('Should return http status 401', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ is_oa, oa_status }',
        })
        .set('x-api-key', apikey4);

      expect(response.statusCode).toBe(401);
    });
  });
});
