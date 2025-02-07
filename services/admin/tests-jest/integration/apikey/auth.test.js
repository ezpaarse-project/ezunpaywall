const request = require('supertest');
const { apikey } = require('config');

const app = require('../../../src/app');
const redis = require('../../../src/lib/redis');
const apikeyLib = require('../../utils/apikey');

describe('API Key: auth', () => {
  let key;

  const configApikey = {
    name: 'test-user1',
    owner: 'test',
    description: 'Created by test program',
    access: ['graphql'],
    attributes: ['*'],
    allowed: true,
  };
  beforeEach(async () => {
    key = await apikeyLib.create(configApikey);
  });

  it('Should get all API key', async () => {
    const response = await request(app)
      .get('/apikeys')
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
  });

  it('Should not create API key', async () => {
    const testValue = apikeyLib.data.apikey2;

    const response = await request(app)
      .post('/apikeys')
      .send(testValue);

    expect(response.statusCode).toBe(401);
  });

  it('Should not update API key', async () => {
    const testValue = {
      name: 'test-user2',
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue);

    expect(response.statusCode).toBe(401);
  });

  it('Should not update API key', async () => {
    const response = await request(app)
      .delete(`/apikeys/${key}`);

    expect(response.statusCode).toBe(401);
  });

  afterAll(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
    await redisClient.quit();
    app.close();
  });
});
