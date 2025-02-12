const request = require('supertest');
const { format } = require('date-fns');
const { apikey } = require('config');

const app = require('../../../src/app');
const redis = require('../../../src/lib/redis');
const apikeyLib = require('../../utils/apikey');

describe('API Key: update', () => {
  let key;
  const configApikey = apikeyLib.data.apikey1;

  beforeEach(async () => {
    key = await apikeyLib.create(configApikey);
  });

  afterEach(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
  });

  afterAll(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
    await redisClient.quit();
    app.close();
  });

  it('Should update name of apikey', async () => {
    const testValue = {
      name: 'test-user2',
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      name: testValue.name,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should update access of apikey', async () => {
    const testValue = {
      access: ['graphql', 'enrich'],
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      access: testValue.access,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should update attributes with doi of apikey', async () => {
    const testValue = {
      attributes: ['doi'],
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      attributes: testValue.attributes,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should update attributes with doi and is_oa of apikey', async () => {
    const testValue = {
      attributes: ['doi', 'is_oa'],
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      attributes: testValue.attributes,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should update allowed of apikey', async () => {
    const testValue = {
      allowed: false,
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      allowed: testValue.allowed,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should update owner of apikey', async () => {
    const testValue = {
      owner: 'new-owner',
    };

    const resultValue = {
      ...configApikey,
      apikey: key,
      owner: testValue.owner,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .put(`/apikeys/${key}`)
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });
});
