const request = require('supertest');
const { apikey, cron } = require('config');
const { resetDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdate } = cron;
describe('Cron: update dataUpdate', () => {
  afterEach(async () => {
    await resetDataUpdateCron();
  });

  afterAll(async () => {
    app.close();
  });

  it('Should update schedule of cron', async () => {
    const testValue = {
      schedule: '0 0 0 1 * *',
    };

    const resultValue = {
      ...dataUpdate,
      schedule: testValue.schedule,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should update index of cron', async () => {
    const testValue = {
      index: 'unpaywall2',
    };

    const resultValue = {
      ...dataUpdate,
      index: testValue.index,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should update interval of cron', async () => {
    const testValue = {
      interval: 'week',
    };

    const resultValue = {
      ...dataUpdate,
      interval: testValue.interval,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should update anteriority of cron', async () => {
    const testValue = {
      anteriority: 5,
    };

    const resultValue = {
      ...dataUpdate,
      anteriority: testValue.anteriority,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.body).toEqual(resultValue);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });

  it('Should not update interval of cron because month is not allowed', async () => {
    const testValue = {
      interval: 'month',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(400);
  });

  it('Should not update schedule of cron because it is not in good format', async () => {
    const testValue = {
      schedule: '* * *',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue)
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(400);
  });
});
