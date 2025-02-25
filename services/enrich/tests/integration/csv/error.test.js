const path = require('path');
const request = require('supertest');
const { setTimeout } = require('timers/promises');

const app = require('../../../src/app');

const { loadApikey } = require('../../utils/apikey');

const enrichDir = path.resolve(__dirname, '..', '..', 'utils', 'sources');

describe('Enrich: job on csv file', () => {
  const apikey1 = 'apikey1';

  beforeAll(async () => {
    await setTimeout(10);
    await loadApikey();
  });

  describe('[job][csv]: Not enrich because wrong args', () => {
    let id;

    it('Should upload the file', async () => {
      const response = await request(app)
        .post('/upload')
        .attach('file', path.resolve(enrichDir, 'mustBeEnrich', 'file01.csv'), 'file01.csv')
        .set('Content-Type', 'text/csv')
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(200);

      id = response?.body;
    });

    it('Should return a error message', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
          args: '{ coin }',
        })
        .set('x-api-key', apikey1);

      // TODO 2023-02-02 Add 401
      expect(response.statusCode).toBe(200);
      // console.log(response.body);
    });
  });

  describe('[job][csv]: Not enrich because file not exist', () => {
    const id = 'test';

    it('Should return http status 404', async () => {
      const response = await request(app)
        .post(`/job/${id}`)
        .send({
          type: 'csv',
          index: 'unpaywall-test',
        })
        .set('x-api-key', apikey1);

      expect(response.statusCode).toBe(404);
    });
  });

  afterAll(async () => {
    app.close();
  });
});
