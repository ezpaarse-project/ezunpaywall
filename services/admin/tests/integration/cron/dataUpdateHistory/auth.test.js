const request = require('supertest');
const { stopDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

describe('Cron: auth for dataUpdateHistory', () => {
  afterAll(async () => {
    await stopDataUpdateCron();
    app.close();
  });

  it('Should not start cron', async () => {
    const updateResponse = await request(app)
      .post('/cron/dataUpdateHistory/start');

    expect(updateResponse.statusCode).toBe(401);
  });

  it('Should not stop cron', async () => {
    const updateResponse = await request(app)
      .post('/cron/dataUpdateHistory/stop');

    expect(updateResponse.statusCode).toBe(401);
  });

  it('Should not update schedule of cron', async () => {
    const testValue = {
      schedule: '0 0 0 1 * *',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue);

    expect(updateResponse.statusCode).toBe(401);
  });

  it('Should not update index of cron', async () => {
    const testValue = {
      index: 'unpaywall2',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue);

    expect(updateResponse.statusCode).toBe(401);
  });

  it('Should not update indexHistory of cron', async () => {
    const testValue = {
      indexHistory: 'unpaywall2',
    };

    const updateResponse = await request(app)
      .patch('/cron/dataUpdate')
      .send(testValue);

    expect(updateResponse.statusCode).toBe(401);
  });
});
