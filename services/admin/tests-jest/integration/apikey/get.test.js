const request = require('supertest');
const { format } = require('date-fns');
const { apikey } = require('config');

const app = require('../../../src/app');
const redis = require('../../../src/lib/redis');
const apikeyLib = require('../../utils/apikey');

describe('API Key: get', () => {
  let key1;
  let key2;
  const configApikey1 = apikeyLib.data.apikey1;
  const configApikey2 = apikeyLib.data.apikey2;

  beforeEach(async () => {
    key1 = await apikeyLib.create(configApikey1);
    key2 = await apikeyLib.create(configApikey2);
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

  it('Should get config of API key', async () => {
    const response = await request(app)
      .get(`/apikeys/${key1}`);

    const resultValue = {
      ...configApikey1,
      createdAt: format(new Date(), 'yyyy-MM-dd'),
    };

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should get all config of all API keys', async () => {
    const response = await request(app)
      .get('/apikeys')
      .set('x-api-key', apikey);

    const resultValue = [
      {
        apikey: key1,
        config: {
          ...configApikey1,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
        },
      },
      {
        apikey: key2,
        config: {
          ...configApikey2,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
        },
      },
    ];

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });

  it('Should get all config of all API keys', async () => {
    const response = await request(app)
      .get('/apikeys/test')
      .set('x-api-key', apikey);

    expect(response.statusCode).toBe(404);
  });
});
