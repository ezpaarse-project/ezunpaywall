const { apikey } = require('config');
const buildApp = require('../../../src/app');
const { getClient } = require('../../../src/lib/redis/client');
const apikeyLib = require('../../utils/apikey');

describe('API Key: auth', () => {
  let app;
  let key;

  const configApikey = {
    name: 'test-user1',
    owner: 'test',
    description: 'Created by test program',
    access: ['graphql'],
    attributes: ['*'],
    allowed: true,
  };

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  beforeEach(async () => {
    key = await apikeyLib.create(configApikey);
  });

  afterAll(async () => {
    const redisClient = getClient();
    await redisClient.flushall();
    await redisClient.quit();
    await app.close();
  });

  it('Should get all API key', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/apikeys',
      headers: { 'x-api-key': apikey },
    });

    expect(response.statusCode).toBe(200);
  });

  it('Should not create API key', async () => {
    const testValue = apikeyLib.data.apikey2;

    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: testValue,
    });

    expect(response.statusCode).toBe(401);
  });

  it('Should not update API key', async () => {
    const testValue = { name: 'test-user2' };

    const response = await app.inject({
      method: 'PUT',
      url: `/apikeys/${key}`,
      payload: {
        apikeyConfig: testValue,
      },
    });

    expect(response.statusCode).toBe(401);
  });

  it('Should not delete API key', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: `/apikeys/${key}`,
    });

    expect(response.statusCode).toBe(401);
  });
});
