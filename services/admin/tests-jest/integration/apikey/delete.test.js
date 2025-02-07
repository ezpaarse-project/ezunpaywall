const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../src/app');
const redis = require('../../../src/lib/redis');
const apikeyLib = require('../../utils/apikey');

describe('API Key: delete', () => {
  let key;
  const configApikey = apikeyLib.data.apikey1;
  beforeEach(async () => {
    key = await apikeyLib.create(configApikey);
  });
  afterEach(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
  });
  it('Should delete apikey', async () => {
    const deleteResponse = await request(app)
      .delete(`/apikeys/${key}`)
      .set('x-api-key', apikey);

    expect(deleteResponse.statusCode).toBe(204);

    const getResponse = await request(app)
      .get(`/apikeys/${key}`);

    expect(getResponse.statusCode).toBe(404);
  });

  it('Should not delete apikey because apikey does not exist', async () => {
    const deleteResponse = await request(app)
      .delete('/apikeys/test')
      .set('x-api-key', apikey);

    expect(deleteResponse.statusCode).toBe(404);
  });

  afterAll(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
    await redisClient.quit();
    app.close();
  });
});
