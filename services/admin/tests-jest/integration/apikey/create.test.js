const request = require('supertest');
const { format } = require('date-fns');
const { apikey } = require('config');

const app = require('../../../src/app');
const redis = require('../../../src/lib/redis');
const apikeyLib = require('../../utils/apikey');

describe('API key: create', () => {
  afterAll(async () => {
    const redisClient = redis.getClient();
    await redisClient.flushall();
    await redisClient.quit();
    app.close();
  });

  it('Should create apikey with config', async () => {
    const testValue = apikeyLib.data.apikey1;

    const resultValue = {
      ...testValue,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .post('/apikeys')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body.apikey).toBeTruthy();
    expect(response.body.config).toEqual(resultValue);
  });

  it('Should create apikey with only name', async () => {
    const testValue = {
      name: 'test-user2',
    };

    const resultValue = {
      ...testValue,
      owner: '',
      description: '',
      access: ['graphql'],
      attributes: ['*'],
      allowed: true,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    const response = await request(app)
      .post('/apikeys')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(200);
    expect(response.body.apikey).toBeTruthy();
    expect(response.body.config).toEqual(resultValue);
  });

  it('Should not create apikey because it already exists a apikey with this name', async () => {
    const testValue = {
      name: 'test-user2',
    };

    const response = await request(app)
      .post('/apikeys')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(409);
  });

  it('Should not create apikey because config.access are in wrong format', async () => {
    const response = await request(app)
      .post('/apikeys')
      .send({
        name: 'test-user1',
        access: 'hello',
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.access "test" does not exist', async () => {
    const response = await request(app)
      .post('/apikeys')
      .send({
        name: 'test-user1',
        access: ['test'],
        attributes: ['*'],
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.attributes is in wrong format', async () => {
    const response = await request(app)
      .post('/apikeys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 1,
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.attributes "test" doesn\'t exist', async () => {
    const response = await request(app)
      .post('/apikeys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: 'test',
        allowed: true,
      })
      .set('x-api-key', 'changeme');

    expect(response.statusCode).toBe(400);
  });

  it('Should not create apikey because config.allowed is in wrong format', async () => {
    const response = await request(app)
      .post('/apikeys')
      .send({
        name: 'test-user1',
        access: ['graphql'],
        attributes: ['*'],
        allowed: 1,
      })
      .set('x-api-key', 'changeme');

    expect(response.statusCode).toBe(400);
  });
});
