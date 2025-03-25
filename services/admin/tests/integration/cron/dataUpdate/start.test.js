const request = require('supertest');
const { apikey, cron } = require('config');
const { stopDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdate } = cron;
describe('Cron: start dataUpdate', () => {
  afterAll(async () => {
    await stopDataUpdateCron();
    app.close();
  });

  it('Should active cron', async () => {
    const resultValue = {
      ...dataUpdate,
      active: true,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .post('/cron/dataUpdate/start')
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(202);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });
});
