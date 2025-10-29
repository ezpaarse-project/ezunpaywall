const { format } = require('date-fns');
const { apikey } = require('config');

const buildApp = require('../../../src/app');
const { getClient } = require('../../../src/lib/redis/client');
const apikeyLib = require('../../utils/apikey');

describe('API key: create', () => {
  let app;

  beforeAll(async () => {
    app = await buildApp({ skipCron: true });
    await app.ready();
  });

  afterAll(async () => {
    const redisClient = getClient();
    await redisClient.flushall();
    await redisClient.quit();
    await app.close();
  });

  it('Should create apikey with config', async () => {
    const testValue = apikeyLib.data.apikey1;

    const resultValue = {
      ...testValue,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: testValue,
      headers: { 'x-api-key': apikey },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    console.log(body);
    expect(body.apikey).toBeTruthy();
    expect(body.config).toEqual(resultValue);
  });

  it('Should create apikey with only name', async () => {
    const testValue = { name: 'test-user2' };

    const resultValue = {
      ...testValue,
      owner: '',
      description: '',
      access: ['graphql'],
      attributes: ['*'],
      allowed: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: testValue,
      headers: { 'x-api-key': apikey },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.apikey).toBeTruthy();
    expect(body.config).toEqual(resultValue);
  });

  it('Should not create apikey because it already exists a apikey with this name', async () => {
    const testValue = { name: 'test-user2' };

    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: testValue,
      headers: { 'x-api-key': apikey },
    });

    expect(response.statusCode).toBe(409);
  });

  it('Should not create apikey because config.access are in wrong format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: {
        name: 'test-user1',
        access: 'hello',
        attributes: ['*'],
        allowed: true,
      },
      headers: { 'x-api-key': 'changeme' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.access "test" does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: {
        name: 'test-user1',
        access: ['test'],
        attributes: ['*'],
        allowed: true,
      },
      headers: { 'x-api-key': 'changeme' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.attributes is in wrong format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: {
        name: 'test-user1',
        access: ['graphql'],
        attributes: 1,
        allowed: true,
      },
      headers: { 'x-api-key': 'changeme' },
    });

    expect(response.statusCode).toBe(400);
  });

  it("Should not create apikey because config.attributes 'test' doesn't exist", async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: {
        name: 'test-user1',
        access: ['graphql'],
        attributes: 'test',
        allowed: true,
      },
      headers: { 'x-api-key': 'changeme' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.allowed is in wrong format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: {
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: 1,
      },
      headers: { 'x-api-key': 'changeme' },
    });

    expect(response.statusCode).toBe(400);
  });
});
