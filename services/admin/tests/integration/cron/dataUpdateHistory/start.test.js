const request = require('supertest');
const { apikey, cron } = require('config');
const { stopDataUpdateHistoryCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdateHistory } = cron;
describe('Cron: start dataUpdateHistory', () => {
  afterAll(async () => {
    await stopDataUpdateHistoryCron();
    app.close();
  });

  it('Should active cron', async () => {
    const resultValue = {
      ...dataUpdateHistory,
      active: true,
      name: 'Data update history',
    };

    const updateResponse = await request(app)
      .post('/cron/dataUpdateHistory/start')
      .set('x-api-key', apikey);

    expect(updateResponse.statusCode).toBe(202);

    const getResponse = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(getResponse.body).toEqual(resultValue);
  });
});
