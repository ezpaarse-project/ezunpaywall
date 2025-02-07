const request = require('supertest');
const { apikey, cron } = require('config');
const { resetDataUpdateHistoryCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdateHistory } = cron;
describe('Cron: update dataUpdateHistory', () => {
  afterEach(async () => {
    await resetDataUpdateHistoryCron();
  });

  it('Should update schedule of cron', async () => {
    const testValue = {
      schedule: '0 0 0 1 * *',
    };

    const resultValue = {
      ...dataUpdateHistory,
      schedule: testValue.schedule,
      name: 'Data update history',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should update index of cron', async () => {
    const testValue = {
      index: 'unpaywall2',
    };

    const resultValue = {
      ...dataUpdateHistory,
      index: testValue.index,
      name: 'Data update history',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should update interval of cron', async () => {
    const testValue = {
      interval: 'week',
    };

    const resultValue = {
      ...dataUpdateHistory,
      interval: testValue.interval,
      name: 'Data update history',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should not update interval of cron because month is not allowed', async () => {
    const testValue = {
      interval: 'month',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(400);
  });

  it('Should not update schedule of cron because it is not in good format', async () => {
    const testValue = {
      schedule: '* * *',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdateHistory')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(400);
  });

  afterAll(async () => {
    app.close();
  });
});
