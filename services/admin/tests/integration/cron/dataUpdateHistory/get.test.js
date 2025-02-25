const request = require('supertest');
const { cron } = require('config');
const { resetDataUpdateHistoryCron } = require('../../../utils/cron');

const app = require('../../../../src/app');

const { dataUpdateHistory } = cron;
describe('Cron: get dataUpdateHistory', () => {
  afterAll(async () => {
    await resetDataUpdateHistoryCron();
    app.close();
  });

  it('Should get cron', async () => {
    const resultValue = {
      ...dataUpdateHistory,
      name: 'Data update history',
    };

    const response = await request(app)
      .get('/cron/dataUpdateHistory');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(resultValue);
  });
});
