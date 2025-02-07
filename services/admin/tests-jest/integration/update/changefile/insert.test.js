const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../../src/app');

describe('Job: start changefile insert', () => {
  it('Should get all API key', async () => {
    const response = await request(app)
      .get('/job/changefile/insert/fake1.jsonl.gz')
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
  });

  afterAll(async () => {
    app.close();
  });
});
