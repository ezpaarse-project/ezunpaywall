const request = require('supertest');
const { cron } = require('config');
const { resetDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdate } = cron;
describe('Cron: get dataUpdate', () => {
  afterAll(async () => {
    await resetDataUpdateCron();
    app.close();
  });

  it('Should get cron', async () => {
    const resultValue = {
      ...dataUpdate,
      name: 'Data update',
    };

    const response = await request(app)
      .get('/cron/dataUpdate');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });
});
