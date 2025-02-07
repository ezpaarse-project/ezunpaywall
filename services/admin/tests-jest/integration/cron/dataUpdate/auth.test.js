const request = require('supertest');
const { stopDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

describe('Cron: auth for dataUpdate', () => {
  it('Should not start cron', async () => {
    const updateResponse = await request(app)
      .post('/cron/dataUpdate/start');

    expect(updateResponse.statusCode).toBe(401);
  });

  it('Should not stop cron', async () => {
    const updateResponse = await request(app)
      .post('/cron/dateUpdate/stop');

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

  afterAll(async () => {
    await stopDataUpdateCron();
    app.close();
  });
});
