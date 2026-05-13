const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../../../src/app');

const now = Date.now();
const oneDay = (1 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now + (1 * oneDay)).toISOString().slice(0, 10);
const oneDaysAgo = new Date(now - (1 * oneDay)).toISOString().slice(0, 10);
const twoDaysAgo = new Date(now - (2 * oneDay)).toISOString().slice(0, 10);
const threeDaysGrace = new Date(now - (3 * oneDay)).toISOString().slice(0, 10);

describe('Job: test error for changefile download and insert', () => {
  const indexName = 'unpaywall-test';

  afterAll(async () => {
    app.close();
  });
  describe('[job][changefiles][download][insert]: Does not start job with only endDate', () => {
    it('Should return a status code 400', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, endDate: oneDaysAgo })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });
  });
  describe('[job][changefiles][download][insert]: Does not start job with startDate in wrong format', () => {
    it('Should return a status code 400 for startDate: "Le jour de la saint glinglin"', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: 'Le jour de la saint glinglin' })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });

    it('Should return a status code 400 for startDate: "01-01-2000"', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: '01-01-2000' })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });

    it('Should return a status code 400 for startDate: "2000-50-50"', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: '2000-50-50' })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });
  });
  describe('[job][changefiles][download][insert]: Does not start job with startDate superior that endDate', () => {
    it('Should return a status code 400', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: twoDaysAgo, endDate: threeDaysGrace })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });
  });
  describe('[job][changefiles][download][insert]: Does not start job with startDate superior that today', () => {
    it('Should return a status code 400', async () => {
      const response = await request(app)
        .post('/job/changefiles/download/insert')
        .send({ index: indexName, startDate: tomorrow })
        .set('x-api-key', apikey);

      expect(response.statusCode).toBe(400);
    });
  });
});
