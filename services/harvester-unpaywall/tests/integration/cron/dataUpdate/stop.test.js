const request = require('supertest');
const { apikey, cron } = require('config');
const { resetDataUpdateCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdate } = cron;
describe('Cron: dataUpdate stop', () => {
  afterEach(async () => {
    await resetDataUpdateCron();
  });

  afterAll(async () => {
    app.close();
  });

  it('Should active cron', async () => {
    const resultValue = {
      ...dataUpdate,
      active: false,
      name: 'Data update',
    };

    const updateResponse = await request(app)
      .post('/cron/dataUpdate/stop')
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(202);

    const getResponse = await request(app)
      .get('/cron/dataUpdate');

    expect(getResponse.body).toEqual(resultValue);
  });
});
