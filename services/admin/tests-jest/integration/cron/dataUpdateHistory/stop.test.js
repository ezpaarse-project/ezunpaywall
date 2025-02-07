const request = require('supertest');
const { apikey, cron } = require('config');
const { resetDataUpdateHistoryCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdateHistory } = cron;
describe('Cron: dataUpdate stop', () => {
  afterEach(async () => {
    await resetDataUpdateHistoryCron();
  });

  it('Should active cron', async () => {
    const resultValue = {
      ...dataUpdateHistory,
      active: false,
      name: 'Data update history',
    };

    const updateResponse = await request(app)
      .post('/cron/dataUpdateHistory/stop')
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(202);

    const getResponse = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(getResponse.body).toEqual(resultValue);
  });

  afterAll(async () => {
    app.close();
  });
});
